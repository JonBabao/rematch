"use client";
 
import React from 'react';
import LostItemsList from './LostItemsList';

const HomePage: React.FC = () => {
    return(
        <div className="flex flex-col w-full">
            <div className="flex flex-col bg-white mt-32 mx-10 rounded-lg p-10  ">
                <LostItemsList />
            </div>
        </div>
    );
};

export default HomePage;