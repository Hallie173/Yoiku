import React from "react";
import "./Sidebar.scss";
import Header from "./Header";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
        <Header />
        <ul>
          <li>Menu Item 1</li>
          <li>Menu Item 2</li>
          <li>Menu Item 3</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
