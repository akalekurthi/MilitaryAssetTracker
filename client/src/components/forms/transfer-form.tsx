import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertTransferSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft } from "lucide-react";
import type { z } from "zod";

type TransferFormData = z.infer<typeof insertTransferSchema>;

interface TransferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bases } = useQuery({ queryKey: ["/api/bases"] });
  const { data: assets } = useQuery({ queryKey: ["/api/assets"] });

  const form = useForm<TransferFormData>({
    resolver: zodResolver(insertTransferSchema),
    defaultValues: {
      quantity: 1,
      transferDate: new Date(),
      status: "pending",
    },
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const response = await apiRequest("POST", "/api/transfers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer created",
        description: "The asset transfer has been initiated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/activity"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transfer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    createTransferMutation.mutate(data);
  };

  const selectedFromBase = form.watch("fromBaseId");

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          </div>
          <CardTitle>New Asset Transfer</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset to Transfer</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assets?.map((asset: any) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          {asset.description} ({asset.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromBaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Base</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bases?.map((base: any) => (
                          <SelectItem key={base.id} value={base.id.toString()}>
                            {base.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toBaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Base</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bases?.filter((base: any) => base.id !== selectedFromBase).map((base: any) => (
                          <SelectItem key={base.id} value={base.id.toString()}>
                            {base.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transferDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Transfer Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This transfer will be created with "Pending" status and require approval before completion.
                    Assets will be moved from the source base to the destination base once approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                type="submit"
                disabled={createTransferMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createTransferMutation.isPending ? "Creating Transfer..." : "Create Transfer"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
