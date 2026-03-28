import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A1A] font-serif">
      
      {/* NAVBAR */}
      <div className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-sm" />
          <h1 className="text-2xl tracking-wide">soleada</h1>
        </div>
      </div>

      {/* HERO */}
      <div className="text-center mt-20 px-6">
        <p className="text-sm tracking-[0.3em] text-gray-500 mb-6">
          LEARN | CREATE | BUILD
        </p>

        <h1 className="text-6xl md:text-7xl leading-tight font-medium">
          Where <span className="text-blue-600 italic">stories</span> become <br />
          skills & ideas become <span className="italic">businesses</span>
        </h1>

        <p className="mt-6 text-gray-500 text-lg max-w-xl mx-auto">
          A refined platform designed for the next generation of creative minds and founders.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-10 mt-20 px-10 max-w-5xl mx-auto">
        
        <Card
          icon="→"
          title="log in"
          description="Continue your journey and access your ventures."
        />

        <Card
          icon="+"
          title="create account"
          description="Join the community and start building your future."
        />

      </div>
    </div>
  );
};

type CardProps = {
  icon: string;
  title: string;
  description: string;
};

const Card: React.FC<CardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm hover:shadow-md hover:scale-[1.02] transition duration-300">
      
      <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white mb-6 text-xl">
        {icon}
      </div>

      <h2 className="text-3xl italic mb-3">{title}</h2>

      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default App;
