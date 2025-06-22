import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowRightLeft, Users } from "lucide-react";
import type { Activity } from "@/types";

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "purchase":
      return <ShoppingBag className="w-4 h-4 text-green-600" />;
    case "transfer":
      return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
    case "assignment":
      return <Users className="w-4 h-4 text-amber-600" />;
    default:
      return <ShoppingBag className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "purchase":
      return "bg-green-100 ring-green-200";
    case "transfer":
      return "bg-blue-100 ring-blue-200";
    case "assignment":
      return "bg-amber-100 ring-amber-200";
    default:
      return "bg-gray-100 ring-gray-200";
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return "Less than an hour ago";
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul className="-mb-8 space-y-4">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.base} • By: {activity.user}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp}>
                          {formatTimeAgo(activity.timestamp)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ShoppingBag className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
