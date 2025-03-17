
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BookType {
  id: number;
  name: string;
  author: string;
  status?: string;
}

const Library = () => {
  const [role, setRole] = useState<string | null>(null);
  const [books, setBooks] = useState<BookType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Top book recommendations
  const topPicks = [
    "To Kill a Mockingbird", "1984", "Pride and Prejudice", 
    "The Great Gatsby", "Moby-Dick", "War and Peace", 
    "The Catcher in the Rye", "The Hobbit", 
    "Harry Potter and the Sorcerer's Stone", "Crime and Punishment"
  ];

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (!userRole) {
      navigate("/login");
      return;
    }
    setRole(userRole);
    
    // Load books from localStorage
    const storedBooks = JSON.parse(localStorage.getItem("books") || "[]");
    setBooks(storedBooks);
  }, [navigate]);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookName && author) {
      const newBook = {
        id: Date.now(),
        name: bookName,
        author: author,
      };
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      localStorage.setItem("books", JSON.stringify(updatedBooks));
      setBookName("");
      setAuthor("");
      toast({
        title: "Book Added",
        description: `${bookName} has been added to the library.`,
      });
    }
  };

  const removeBook = (id: number) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    localStorage.setItem("books", JSON.stringify(updatedBooks));
    toast({
      title: "Book Removed",
      description: "The book has been removed from the library.",
    });
  };

  const borrowBook = (id: number) => {
    const updatedBooks = books.map(book => 
      book.id === id ? { ...book, status: "Borrowed" } : book
    );
    setBooks(updatedBooks);
    localStorage.setItem("books", JSON.stringify(updatedBooks));
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
    localStorage.setItem("books", JSON.stringify(updatedBooks));
    toast({
      title: "Book Returned",
      description: "You have successfully returned this book.",
    });
  };

  const filteredBooks = books.filter(book =>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {topPicks.map((book, index) => (
                    <Card key={index} className="glass-card border-white/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Book className="h-6 w-6 text-purple-400" />
                        <span className="text-white">{book}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Find a Book</h2>
                <div className="flex items-center glass-card border-white/20 p-2 rounded-md mb-4 w-full max-w-md">
                  <Search className="h-5 w-5 text-gray-400 mr-2" />
                  <Input
                    type="search"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                  />
                </div>

                <div className="overflow-x-auto glass-card border-white/20 rounded-lg">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="p-4 border-b border-white/10">Name</th>
                        <th className="p-4 border-b border-white/10">Author</th>
                        <th className="p-4 border-b border-white/10">Status</th>
                        <th className="p-4 border-b border-white/10">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                          <tr key={book.id}>
                            <td className="p-4 border-b border-white/10">{book.name}</td>
                            <td className="p-4 border-b border-white/10">{book.author}</td>
                            <td className="p-4 border-b border-white/10">{book.status || "Available"}</td>
                            <td className="p-4 border-b border-white/10">
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
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center">No books found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {role === "admin" && (
            <div className="mb-10">
              <Card className="glass-card border-white/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Add New Book</CardTitle>
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
                      Add Book
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="overflow-x-auto glass-card border-white/20 rounded-lg">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-white/10">Name</th>
                      <th className="p-4 border-b border-white/10">Author</th>
                      <th className="p-4 border-b border-white/10">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.length > 0 ? (
                      books.map((book) => (
                        <tr key={book.id}>
                          <td className="p-4 border-b border-white/10">{book.name}</td>
                          <td className="p-4 border-b border-white/10">{book.author}</td>
                          <td className="p-4 border-b border-white/10">
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBook(book.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center">No books in the library</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
