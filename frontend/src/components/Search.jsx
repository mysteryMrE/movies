import React from "react";

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <>
      <h1>
        Find <span className="text-gradient">Movies</span> You'll Enjoy Without
        the Hassle
      </h1>
      <div className="search">
        <div>
          <img src="search.svg" alt="search" />
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default Search;
