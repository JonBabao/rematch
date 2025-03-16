"use client";

import React from 'react';
import TopNav from '../TopNav'

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return(
        <div>
            <TopNav />
            <main>{children}</main>
        </div>
    );
};

export default MainLayout;