import { toast } from "@/components/ui/use-toast";

export interface Book {
  id: number;
  name: string;
  author: string;
  status?: string;
  coverImage?: string;
}

export class BookService {
  // Get user's personal books from localStorage
  static getLocalBooks(): Book[] {
    return JSON.parse(localStorage.getItem("books") || "[]");
  }

  // Save user's personal books to localStorage
  static saveLocalBooks(books: Book[]): void {
    localStorage.setItem("books", JSON.stringify(books));
  }

  // Get admin-added books (shared database)
  static getAdminBooks(): Book[] {
    return JSON.parse(localStorage.getItem("admin_books") || "[]");
  }

  // Save admin-added books (shared database)
  static saveAdminBooks(books: Book[]): void {
    localStorage.setItem("admin_books", JSON.stringify(books));
  }

  // Add a book to the admin database
  static addAdminBook(book: Book): void {
    const adminBooks = this.getAdminBooks();
    adminBooks.push(book);
    this.saveAdminBooks(adminBooks);
  }

  // Remove a book from the admin database
  static removeAdminBook(id: number): void {
    const adminBooks = this.getAdminBooks();
    const updatedBooks = adminBooks.filter(book => book.id !== id);
    this.saveAdminBooks(updatedBooks);
  }

  // Search both local and admin books first, then fallback to API
  static async searchBooks(query: string): Promise<Book[]> {
    try {
      if (!query || query.trim() === "") {
        return [];
      }

      // First check admin books (our "database")
      const adminBooks = this.getAdminBooks();
      const localMatches = adminBooks.filter(book =>
        book.name.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );

      // If we found matches in the admin books, return those
      if (localMatches.length > 0) {
        return localMatches;
      }

      // Otherwise, search the Open Library API as fallback
      const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=20`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      
      return data.docs.map((book: any, index: number) => ({
        id: Date.now() + index, // Generate a unique ID
        name: book.title,
        author: book.author_name ? book.author_name.join(", ") : "Unknown",
        coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : undefined
      }));
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to fetch books from the database",
        variant: "destructive",
      });
      return [];
    }
  }

  // Get book recommendations - first from admin books, then from API
  static async getRecommendations(): Promise<Book[]> {
    // First check if we have enough admin books to show as recommendations
    const adminBooks = this.getAdminBooks();
    if (adminBooks.length >= 5) {
      // Return a random selection from admin books
      return adminBooks.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    try {
      // Fetch popular books from Open Library
      const response = await fetch("https://openlibrary.org/search.json?q=subject:fiction&sort=rating&limit=10");
      
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      
      return data.docs.map((book: any, index: number) => ({
        id: Date.now() + index,
        name: book.title,
        author: book.author_name ? book.author_name.join(", ") : "Unknown",
        coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : undefined
      }));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Return fallback recommendations
      return [
        { id: 1, name: "To Kill a Mockingbird", author: "Harper Lee" },
        { id: 2, name: "1984", author: "George Orwell" },
        { id: 3, name: "Pride and Prejudice", author: "Jane Austen" },
        { id: 4, name: "The Great Gatsby", author: "F. Scott Fitzgerald" },
        { id: 5, name: "Moby-Dick", author: "Herman Melville" }
      ];
    }
  }
}
