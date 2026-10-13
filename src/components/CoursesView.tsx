import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Course } from '../types';

interface CoursesViewProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onLaunchPlayer?: (course: Course) => void;
  selectedCategoryFilter?: string;
  setSelectedCategoryFilter?: (category: string) => void;
}

export default function CoursesView({ 
  courses, 
  onEnroll,
  onLaunchPlayer,
  selectedCategoryFilter = 'All',
  setSelectedCategoryFilter
}: CoursesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategoryFilter);
  const [activeLevel, setActiveLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'duration'

  // Keep internal state in sync if parent updates it (e.g. from Mega Menu click)
  useEffect(() => {
    setActiveCategory(selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  // Extract all categories dynamically to ensure full coverage
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Handle category option click
  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (setSelectedCategoryFilter) {
      setSelectedCategoryFilter(cat);
    }
  };

  // Filter and sort the courses list
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesLevel = activeLevel === 'All' || course.level === activeLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.enrollmentCount - a.enrollmentCount;
    if (sortBy === 'rating') return b.ratingAverage - a.ratingAverage;
    if (sortBy === 'duration') {
      const durA = parseInt(a.duration) || 0;
      const durB = parseInt(b.duration) || 0;
      return durB - durA;
    }
    return 0;
  });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left" id="courses-catalog-page">
      {/* Page Header */}
      <div className="space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00aaff]/10 border border-[#00ddff]/30 rounded-full text-xs font-bold text-[#00ddff] font-mono uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Accredited Academic Curriculum</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
          Digital Manufacturing Courses
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
          Unlock state-of-the-art labs curated by lead researchers from Birmingham City University and AIUB. Filter courses by category or search target parameters.
        </p>
      </div>

      {/* Persistent Filters & Search Control Station */}
      <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md space-y-6 mb-12">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, topic, or presenter (e.g., Digital Twin, Dr. Butt)..."
              className="w-full text-xs p-3.5 pl-10 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
              id="courses-search-input"
            />
          </div>

          {/* Quick sorting dropdown */}
          <div className="flex sm:items-center gap-3 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs p-2.5 rounded-lg bg-slate-950 border border-white/10 text-slate-350 font-sans focus:outline-none focus:border-blue-500 cursor-pointer"
              id="courses-sort-select"
            >
              <option value="popular">Popularity (High to Low)</option>
              <option value="rating">Rating (Highest Stars)</option>
              <option value="duration">Study Duration (Longest)</option>
            </select>
            
            {(searchQuery || activeCategory !== 'All' || activeLevel !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleCategoryClick('All');
                  setActiveLevel('All');
                }}
                className="flex items-center gap-1 p-2.5 px-3 text-xs font-bold text-red-400 hover:text-white rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/20 transition-all cursor-pointer font-mono"
              >
                <RefreshCw className="w-3 h-3 animate-spin duration-1000" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Pill Selectors */}
        <div className="border-t border-white/5 pt-5 space-y-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Focus Modules:
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-xs py-2 px-4 rounded-xl border font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'border-blue-500 bg-blue-600/20 text-white shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                    : 'border-white/5 bg-[#1e293b]/25 text-slate-400 hover:border-slate-800 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                {cat === 'All' ? '🌐 All Systems' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filters Selectors */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-1 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Academic Difficulty:</span>
            <div className="flex gap-1.5">
              {levels.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    activeLevel === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-slate-450 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div className="text-slate-500 text-[10px]">
            Showing <b className="text-[#00ddff]">{filteredCourses.length}</b> of <b>{courses.length}</b> program-mapped courses
          </div>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div 
              key={course.id}
              className="group flex flex-col rounded-3xl border border-white/5 bg-slate-900/25 overflow-hidden hover:border-[#00aaff]/40 hover:shadow-[0_4px_25px_rgba(0,102,255,0.08)] transition-all duration-300 text-left relative"
              id={`course-card-${course.id}`}
            >
              {/* Highlight Featured Course Label */}
              {course.id === 'c_101' && (
                <div className="absolute top-3.5 right-3.5 z-10 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 text-slate-950 font-extrabold text-[9px] tracking-widest uppercase p-1 px-2.5 rounded shadow-lg font-mono">
                  ★ Flagship Cert
                </div>
              )}

              {/* Course Image Header */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-104 transition-all duration-500 opacity-80"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600";
                  }}
                />
                <span className="absolute bottom-3 left-3 p-1 px-2.5 text-[9px] bg-slate-950/90 rounded border border-white/10 font-mono font-bold text-[#00ddff] uppercase">
                  {course.category}
                </span>
              </div>
              
              {/* Card Body content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="text-slate-500 font-bold uppercase">DIFFICULTY: <b className="text-slate-350">{course.level}</b></span>
                    <span className="text-slate-500 font-bold uppercase">DURATION: <b className="text-slate-350">{course.duration}</b></span>
                  </div>
                  
                  <h4 className="text-base font-extrabold leading-snug line-clamp-2 text-slate-100 group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h4>
                  
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans">
                    {course.headline}
                  </p>
                </div>

                {/* Expanded outline previews */}
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-600 block tracking-wider">Lab Chapters:</span>
                    {course.lessons.slice(0, 3).map((l, lIdx) => (
                      <div key={l.id} className="truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>M{lIdx + 1}: {l.title}</span>
                      </div>
                    ))}
                    {course.lessons.length > 3 && (
                      <div className="text-[9px] text-[#00ddff] pl-3 font-semibold">
                        + {course.lessons.length - 3} more modules and interactive quiz
                      </div>
                    )}
                  </div>

                  {/* Rating / Instructor signature */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="text-slate-400 truncate max-w-[120px]">{course.instructorName}</span>
                    </div>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5 shrink-0">
                      ★ {course.ratingAverage} <b className="text-slate-500 font-normal">({course.enrollmentCount} enrollees)</b>
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="flex gap-2">
                  {course.isFree && onLaunchPlayer ? (
                    <button
                      onClick={() => onLaunchPlayer(course)}
                      className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.4)] text-xs font-extrabold text-white cursor-pointer transition-all uppercase tracking-wider font-sans"
                    >
                      ▶ Enroll Free
                    </button>
                  ) : (
                    <button
                      onClick={() => onEnroll(course.id)}
                      className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.4)] text-xs font-extrabold text-white cursor-pointer transition-all uppercase tracking-wider font-sans"
                    >
                      {course.isFree ? 'Enroll Free' : 'Enroll Now'}
                    </button>
                  )}
                  {onLaunchPlayer && !course.isFree && (
                    <button
                      onClick={() => onLaunchPlayer(course)}
                      className="flex-1 text-center py-2.5 rounded-xl border border-[#38bdf8]/50 bg-[#0a1530] hover:bg-[#38bdf8]/10 hover:border-[#38bdf8] text-[#38bdf8] text-xs font-extrabold cursor-pointer transition-all uppercase tracking-wider font-sans"
                      title="Open full course player"
                    >
                      ▶ Launch Player
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center border border-white/5 rounded-3xl bg-slate-900/20 space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-extrabold text-white">No Accredited Programs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your search query "{searchQuery}" did not yield any laboratory courses matching the difficulty level "{activeLevel}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleCategoryClick('All');
              setActiveLevel('All');
            }}
            className="text-xs text-[#00ddff] underline cursor-pointer hover:text-white"
          >
            Clear current filters
          </button>
        </div>
      )}
    </div>
  );
}
