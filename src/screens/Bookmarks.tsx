import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuestions } from "@/hooks/useQuestions"; // Import useQuestions
import { PageLayout } from "@/components/PageLayout";
import { getBookmarkedQuestions, toggleBookmark } from "@/lib/storage";
import { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export const Bookmarks = (): JSX.Element => {
  // Local state for UI filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch base question data
  const {
    data: questionData,
    isLoading: isLoadingBase,
    isError: isErrorBase,
  } = useQuestions();

  // Fetch bookmarked questions using TanStack Query, dependent on base data
  const { data: bookmarks, isLoading: isLoadingBookmarks, isError: isErrorBookmarks } = useQuery<Question[]>({
    queryKey: ['bookmarks', questionData?.allQuestions], // Include base data in key
    queryFn: () => {
      if (!questionData?.allQuestions) return []; // Don't run if base data not ready
      return getBookmarkedQuestions(questionData.allQuestions); // Pass allQuestions
    },
    enabled: !!questionData?.allQuestions, // Enable only when base data is available
    staleTime: 1000 * 60,
  });

  // Combine loading and error states
  const isLoading = isLoadingBase || isLoadingBookmarks;
  const isError = isErrorBase || isErrorBookmarks;
  const safeBookmarks = bookmarks ?? []; // Use empty array if data is undefined

  // Mutation for toggling bookmarks
  const { mutate: toggleBookmarkMutation } = useMutation({
    mutationFn: toggleBookmark,
    onSuccess: (isNowBookmarked, questionId) => {
      // Invalidate the bookmarks query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast(isNowBookmarked ? "Bookmark added" : "Bookmark removed");

      // Optional: Optimistic update (more complex, skipped for now)
      // queryClient.setQueryData(['bookmarks'], (oldData: Question[] | undefined) => {
      //   if (!oldData) return [];
      //   return isNowBookmarked
      //     ? [...oldData, /* need full question object here */ ]
      //     : oldData.filter(q => q.id !== questionId);
      // });
    },
    onError: (error) => {
      console.error("Failed to toggle bookmark:", error);
      toast.error("Failed to update bookmark. Please try again.");
      // Invalidate to ensure consistency if optimistic update was used
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
  
  const handleRemoveBookmark = (questionId: string) => {
    // Call the mutation
    toggleBookmarkMutation(questionId);
  };
  
  // Memoize unique weeks for filter
  const weeks = useMemo(() => {
    if (isLoading || isError || !safeBookmarks) return []; // Guard against undefined/loading data
    return Array.from(new Set(safeBookmarks.map(b => b.week))).sort((a, b) => a - b);
  }, [safeBookmarks, isLoading, isError]); // Update dependencies

  // Memoize filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    if (isLoading || isError || !safeBookmarks) return []; // Guard against undefined/loading data
    return safeBookmarks.filter(bookmark => {
      // Week filter
      if (selectedWeek !== null && bookmark.week !== selectedWeek) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          bookmark.question.toLowerCase().includes(lowerSearchTerm) ||
          (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
        );
      }
      return true;
    });
  }, [safeBookmarks, selectedWeek, searchTerm, isLoading, isError]); // Update dependencies
  
  return (
    <PageLayout title="Bookmarks">
      <div className="max-w-2xl mx-auto">
        {/* Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedWeek === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedWeek(null)}
            >
              All
            </Badge>
            {/* Render weeks only if not loading/error */}
            {!isLoading && !isError && weeks.map(week => (
              <Badge
                key={week} // Assuming week is number here, TS might complain if mixed types
                variant={selectedWeek === week ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedWeek(week === selectedWeek ? null : week)}
              >
                Week {week}
              </Badge>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
           <p className="text-destructive text-center py-4">Error loading bookmarks. Please try again later.</p>
        // Removed misplaced </div> from here
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-10">
            <Bookmark size={48} className="mx-auto mb-3 text-muted-foreground opacity-20" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks found</h2>
            <p className="text-muted-foreground mb-6">
              {/* Check safeBookmarks length */}
              {safeBookmarks.length === 0
                ? "You haven't bookmarked any questions yet."
                : "No bookmarks match your filters."}
            </p>
            {selectedWeek !== null || searchTerm ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedWeek(null);
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/">
                <Button>Start a Quiz</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              {/* Use filteredBookmarks length */}
              <h2 className="font-semibold">{filteredBookmarks.length} Bookmarked Question{filteredBookmarks.length !== 1 ? 's' : ''}</h2>
              {filteredBookmarks.length > 0 && (
                <Link to="/quiz/bookmark">
                  <Button size="sm">Quiz Bookmarks</Button>
                </Link>
              )}
            </div>
            
            {filteredBookmarks.map(bookmark => (
              <Card key={bookmark.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-muted-foreground mb-2">
                      Week {bookmark.week} · {bookmark.tags.join(" · ")}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      className="text-amber-500"
                    >
                      <Bookmark size={18} />
                    </Button>
                  </div>
                  
                  <p className="font-medium mb-2 whitespace-pre-wrap">{bookmark.question}</p>
                  
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Answer: </span>
                      {bookmark.options[bookmark.correctIndex]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </PageLayout>
  );
};

// No default export needed, using named export above
