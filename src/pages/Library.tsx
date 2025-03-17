
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book as BookIcon, Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BookService, Book } from "@/utils/BookService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Library = () => {
  const [role, setRole] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [adminBooks, setAdminBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (!userRole) {
      navigate("/login");
      return;
    }
    setRole(userRole);
    
    // Load books from localStorage
    const storedBooks = BookService.getLocalBooks();
    setBooks(storedBooks);
    
    // Load admin books
    const storedAdminBooks = BookService.getAdminBooks();
    setAdminBooks(storedAdminBooks);
    
    // Fetch book recommendations
    fetchRecommendations();
  }, [navigate]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recommendedBooks = await BookService.getRecommendations();
      setRecommendations(recommendedBooks);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookName && author) {
      const newBook = {
        id: Date.now(),
        name: bookName,
        author: author,
        status: "Available"
      };
      
      // For admin, add the book to the admin database
      if (role === "admin") {
        const updatedAdminBooks = [...adminBooks, newBook];
        setAdminBooks(updatedAdminBooks);
        BookService.saveAdminBooks(updatedAdminBooks);
        toast({
          title: "Book Added to Database",
          description: `${bookName} has been added to the library database for all users.`,
        });
      } else {
        // For regular users, add to their personal collection
        const updatedBooks = [...books, newBook];
        setBooks(updatedBooks);
        BookService.saveLocalBooks(updatedBooks);
        toast({
          title: "Book Added",
          description: `${bookName} has been added to your personal library.`,
        });
      }
      
      setBookName("");
      setAuthor("");
    }
  };

  const removeBook = (id: number) => {
    if (role === "admin") {
      // Remove from admin database
      const updatedBooks = adminBooks.filter(book => book.id !== id);
      setAdminBooks(updatedBooks);
      BookService.saveAdminBooks(updatedBooks);
      toast({
        title: "Book Removed from Database",
        description: "The book has been removed from the library database.",
      });
    } else {
      // Remove from user's personal library
      const updatedBooks = books.filter(book => book.id !== id);
      setBooks(updatedBooks);
      BookService.saveLocalBooks(updatedBooks);
      toast({
        title: "Book Removed",
        description: "The book has been removed from your library.",
      });
    }
  };

  const borrowBook = (id: number) => {
    const updatedBooks = books.map(book => 
      book.id === id ? { ...book, status: "Borrowed" } : book
    );
    setBooks(updatedBooks);
    BookService.saveLocalBooks(updatedBooks);
    toast({
      title: "Book Borrowed",
      description: "You have successfully borrowed this book.",
    });
  };

  const returnBook = (id: number) => {
    const updatedBooks = books.map(book => 
      book.id === id ? { ...book, status: "Available" } : book
    );
    setBooks(updatedBooks);
    BookService.saveLocalBooks(updatedBooks);
    toast({
      title: "Book Returned",
      description: "You have successfully returned this book.",
    });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await BookService.searchBooks(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Failed to retrieve search results.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addToLocalLibrary = (book: Book) => {
    const existingBook = books.find(b => 
      b.name === book.name && b.author === book.author
    );
    
    if (!existingBook) {
      const updatedBooks = [...books, { ...book, status: "Available" }];
      setBooks(updatedBooks);
      BookService.saveLocalBooks(updatedBooks);
      toast({
        title: "Book Added",
        description: `${book.name} has been added to your library.`,
      });
    } else {
      toast({
        title: "Book Already Exists",
        description: "This book is already in your library.",
      });
    }
  };

  // For regular users, show both their personal books and search results
  const displayedBooks = role === "user" ? 
    [...books, ...searchResults.filter(result => 
      !books.some(book => book.name === result.name && book.author === result.author)
    )] : adminBooks;

  const filteredBooks = displayedBooks.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Library Management System</h1>
          
          {role === "user" && (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Top Picks for You</h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {recommendations.map((book, index) => (
                      <Card key={index} className="glass-card border-white/20 hover:border-purple-400/50 transition-all">
                        <CardContent className="p-4">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.name}
                              className="w-full h-40 object-cover rounded mb-2"
                            />
                          ) : (
                            <div className="w-full h-40 bg-purple-900/30 flex items-center justify-center rounded mb-2">
                              <BookIcon className="h-8 w-8 text-purple-400" />
                            </div>
                          )}
                          <h3 className="text-sm font-medium line-clamp-2">{book.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{book.author}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => addToLocalLibrary(book)}
                          >
                            Add to Library
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Find a Book</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center glass-card border-white/20 p-2 rounded-md w-full">
                      <Search className="h-5 w-5 text-gray-400 mr-2" />
                      <Input
                        type="search"
                        placeholder="Search by title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                <div className="glass-card border-white/20 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Title</TableHead>
                        <TableHead className="text-white">Author</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium">{book.name}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.status || "Available"}</TableCell>
                            <TableCell>
                              {book.status === "Borrowed" ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => returnBook(book.id)}
                                >
                                  Return
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => borrowBook(book.id)}
                                >
                                  Borrow
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No books found. Try searching for a book above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredBooks.length > 0 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}

          {role === "admin" && (
            <div className="mb-10">
              <Card className="glass-card border-white/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Add New Book to Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBook} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Book Name"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Input
                      type="text"
                      placeholder="Author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Add Book to Database
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="glass-card border-white/20 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Title</TableHead>
                      <TableHead className="text-white">Author</TableHead>
                      <TableHead className="text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminBooks.length > 0 ? (
                      adminBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.name}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBook(book.id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          No books in the database. Add some books to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
