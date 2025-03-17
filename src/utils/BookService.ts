
import { toast } from "@/components/ui/use-toast";

export interface Book {
  id: number;
  name: string;
  author: string;
  status?: string;
  coverImage?: string;
}

export class BookService {
  // Get books from localStorage
  static getLocalBooks(): Book[] {
    return JSON.parse(localStorage.getItem("books") || "[]");
  }

  // Save books to localStorage
  static saveLocalBooks(books: Book[]): void {
    localStorage.setItem("books", JSON.stringify(books));
  }

  // Fetch books from Open Library API
  static async searchBooks(query: string): Promise<Book[]> {
    try {
      if (!query || query.trim() === "") {
        return [];
      }

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

  // Get book recommendations from Open Library
  static async getRecommendations(): Promise<Book[]> {
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
