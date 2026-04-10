import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GAMES, NO_IMAGE_URL } from '../../constants';

const GamesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = GAMES.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 flex-1"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-main mb-2">Games Library</h1>
            <p className="text-secondary">Explore our collection of unblocked games.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-accent rounded-xl py-3 pl-12 pr-4 text-main focus:outline-none focus:border-main transition-all" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredGames.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-secondary border border-accent border-dashed rounded-xl">
              <div className="p-4 bg-accent/50 rounded-full mb-4">
                <Gamepad2 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-main mb-2">No Games Found</h3>
              <p className="text-secondary max-w-xs">We couldn't find any games matching your search. Try a different keyword.</p>
            </div>
          ) : (
            filteredGames.map(game => (
              <Link 
                key={game.id}
                to={`/play/${game.id}`}
                className="group relative bg-secondary border border-accent rounded-xl overflow-hidden hover:opacity-80 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="aspect-video overflow-hidden bg-primary">
                  <img 
                    src={game.image || NO_IMAGE_URL} 
                    alt={game.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE_URL; }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-main">{game.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-accent rounded text-secondary">{game.category}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default GamesView;
