
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import apiClient from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

interface TaskActivity {
  id: number;
  eventType: string;
  userName: string;
  timestamp: string;
  content?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}

interface TaskHistoryTabProps {
  taskId: number;
}

const fetchTaskHistory = async (taskId: number) => {
  const url = `/api/tasks/${taskId}/history`;
  
  console.log('Fetchinwertyui:', url);
  
  try {

    const response = await apiClient.get(url);
    console.log('Task history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Task history fetch error:', error);
    throw error;
  }
};

const addComment = async (taskId: number, content: string) => {
  const url = `/api/tasks/${taskId}/comments`;
  
  console.log('Adding comment for taskId:', taskId, 'content:', content);
  
  try {
    const response = await apiClient.post(url, { content });
    console.log('Add comment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
};

export const TaskHistoryTab = ({ taskId }: TaskHistoryTabProps) => {
  const [commentContent, setCommentContent] = useState("");
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['task-history', taskId],
    queryFn: () => fetchTaskHistory(taskId),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => addComment(taskId, content),
    onSuccess: () => {
      setCommentContent("");
      queryClient.invalidateQueries({ queryKey: ['task-history', taskId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!commentContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(commentContent);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const renderActivity = (activity: TaskActivity) => {
    if (activity.eventType === "COMMENT") {
      return (
        <Card key={activity.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                  {getInitials(activity.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{activity.userName}</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(activity.timestamp), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{activity.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (activity.eventType === "FIELD_UPDATE") {
      return (
        <div key={activity.id} className="mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                {getInitials(activity.userName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-slate-600">
              <span className="font-medium">{activity.userName}</span> changed{" "}
              <span className="font-medium">{activity.fieldName}</span> from{" "}
              <span className="font-mono bg-red-100 text-red-800 px-1 rounded">
                {activity.oldValue || "empty"}
              </span>{" "}
              to{" "}
              <span className="font-mono bg-green-100 text-green-800 px-1 rounded">
                {activity.newValue || "empty"}
              </span>
            </span>
            <span className="text-xs text-slate-400 ml-auto">
              {format(new Date(activity.timestamp), "MMM dd, HH:mm")}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {/* Comment Input Form */}
      <div className="space-y-3">
        <Label htmlFor="comment">Add a Comment</Label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts, updates, or questions about this task..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment}
            disabled={commentMutation.isPending || !commentContent.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {commentMutation.isPending ? "Adding..." : "Submit Comment"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* History Feed */}
      <div className="space-y-1">
        <h3 className="font-medium text-slate-900 mb-4">Activity History</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-slate-500">Loading activity history...</div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-500">No activity yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map(renderActivity)}
          </div>
        )}
      </div>
    </div>
  );
};
