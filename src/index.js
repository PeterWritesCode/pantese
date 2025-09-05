// index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AudioPlayer } from './audioPlayer.js';
import AudioToggleButton from "./audioToggleButton.js";
import HomeButton from "./homeButton.js";
import AboutButton from "./aboutButton.js";

const App = lazy(() => import('./App'));
const Page2 = lazy(() => import('./page2'));
const Page3 = lazy(() => import('./page3'));
const About = lazy(() => import('./About'));

import './gsap-brand.css';
import './style.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  
  <AudioPlayer>
    
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AudioToggleButton /> 
      <HomeButton />
      <AboutButton />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  </AudioPlayer>
  
);