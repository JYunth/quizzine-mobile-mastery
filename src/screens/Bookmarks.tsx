import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { getBookmarkedQuestions, isBookmarked, toggleBookmark } from "@/lib/storage";
import { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  
  useEffect(() => {
    const loadBookmarks = async () => {
      setLoading(true);
      const questions = await getBookmarkedQuestions();
      setBookmarks(questions);
      setLoading(false);
    };
    
    loadBookmarks();
  }, []);
  
  const handleRemoveBookmark = (questionId: string) => {
    toggleBookmark(questionId);
    setBookmarks(bookmarks.filter(b => b.id !== questionId));
    toast("Bookmark removed");
  };
  
  // Get unique weeks for filter
  const weeks = Array.from(new Set(bookmarks.map(b => b.week))).sort((a, b) => a - b);
  
  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    // Week filter
    if (selectedWeek !== null && bookmark.week !== selectedWeek) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        bookmark.question.toLowerCase().includes(lowerSearchTerm) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    return true;
  });
  
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
            {weeks.map(week => (
              <Badge 
                key={week}
                variant={selectedWeek === week ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedWeek(week === selectedWeek ? null : week)}
              >
                Week {week}
              </Badge>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading bookmarks...</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-10">
            <Bookmark size={48} className="mx-auto mb-3 text-muted-foreground opacity-20" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks found</h2>
            <p className="text-muted-foreground mb-6">
              {bookmarks.length === 0 
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

export default Bookmarks;
