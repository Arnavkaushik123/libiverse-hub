
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

      // Always search the Google Books API regardless of local matches
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      
      // Extract the relevant information from the Google Books API response
      const apiBooks = data.items ? data.items.map((item: any, index: number) => {
        const volumeInfo = item.volumeInfo;
        return {
          id: Date.now() + index,
          name: volumeInfo.title || "Unknown Title",
          author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author",
          coverImage: volumeInfo.imageLinks?.thumbnail,
          status: "Available" // Mark all API books as available
        };
      }) : [];
      
      // Combine local matches with API results
      const allResults = [...localMatches, ...apiBooks];
      
      // Remove duplicates based on book name and author
      const uniqueResults = allResults.filter((book, index, self) =>
        index === self.findIndex(b => b.name === book.name && b.author === book.author)
      );
      
      console.log(`Search results: ${uniqueResults.length} books found`);
      return uniqueResults;
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to fetch books. Please try again later.",
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
      // Fetch popular books from Google Books API
      const topics = ["fiction", "fantasy", "science", "bestseller", "classic"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${randomTopic}&maxResults=10&orderBy=relevance`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error("No recommendations found");
      }
      
      return data.items.map((item: any, index: number) => {
        const volumeInfo = item.volumeInfo;
        return {
          id: Date.now() + index,
          name: volumeInfo.title || "Unknown Title",
          author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author",
          coverImage: volumeInfo.imageLinks?.thumbnail,
          status: "Available"
        };
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Return fallback recommendations
      return [
        { id: 1, name: "To Kill a Mockingbird", author: "Harper Lee", status: "Available" },
        { id: 2, name: "1984", author: "George Orwell", status: "Available" },
        { id: 3, name: "Pride and Prejudice", author: "Jane Austen", status: "Available" },
        { id: 4, name: "The Great Gatsby", author: "F. Scott Fitzgerald", status: "Available" },
        { id: 5, name: "Moby-Dick", author: "Herman Melville", status: "Available" }
      ];
    }
  }
}
