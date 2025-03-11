
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Hero Section */}
          <section className="text-center animate-fade-in">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Welcome to Libiverse
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your gateway to a world of knowledge and literary adventures. 
              Discover, manage, and explore our vast collection of books.
            </p>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-8 animate-fade-in">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xl font-semibold">Vast Collection</h3>
              <p className="text-gray-300">
                Access thousands of books across multiple genres and categories.
              </p>
            </div>
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xl font-semibold">Easy Management</h3>
              <p className="text-gray-300">
                Efficient tools for librarians to manage the collection.
              </p>
            </div>
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xl font-semibold">Personal Lists</h3>
              <p className="text-gray-300">
                Create and maintain your personal reading lists.
              </p>
            </div>
          </section>

          {/* About Section */}
          <section className="text-center animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">About Us</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Libiverse is more than just a library management system - it's a community of book lovers, 
              scholars, and lifelong learners. Our mission is to make knowledge accessible to everyone 
              while providing powerful tools for library administration.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
