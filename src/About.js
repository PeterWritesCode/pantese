import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { useAudio } from "./audioPlayer.js";

import { useNavigate } from 'react-router-dom';
import { RemoveScrollBar } from 'react-remove-scroll-bar';




export default function main() {
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const { isPlaying, togglePlay } = useAudio();

  


  useLayoutEffect(() => {
  
  /// Lenis instance (gets initialized only after images are loaded)
  // because of the transitions from page to page, lenis and scrolltriggers need to be reset. They can only be started once page2 loads
  // otherwise it is very likely that the page will either exhibit strange behavior in the form of blinking, or freeze completely.
  // We only do it after preloading so the user can't scroll on an empty page
  lenisRef.current = new Lenis({
    duration: 3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  let lastScrollY = 0;

  const raf = (time) => {
    if (!lenisRef.current) return;
    lenisRef.current.raf(time);
    ScrollTrigger.update();
    rafIdRef.current = requestAnimationFrame(raf);
  };

  
  const handleScroll = ({ scroll }) => {
    const { up, down } = blockRef.current;
    const delta = scroll - lastScrollY;
    const isUp = delta < 0;
    const isDown = delta > 0;

    if ((up && isUp) || (down && isDown)) {
      isScrollLocked = true;
      lenisRef.current.scrollTo(lastScrollY, { immediate: true });
      requestAnimationFrame(() => {
        isScrollLocked = false;
      });
    } else {
      lastScrollY = scroll;
    }
  };

  // Initialize
  lenisRef.current.scrollTo(0, { immediate: true });
  lenisRef.current.on("scroll", handleScroll);
  rafIdRef.current = requestAnimationFrame(raf);

  // Wait for DOM <img> elements in this page to fully load/decode,
  // then refresh ScrollTrigger so measurements include image sizes
  const scope = mainRef.current;
  const imgs = Array.from(scope.querySelectorAll("img"));
  const waitForDomImages = Promise.all(
    imgs.map((img) => {
      const settled =
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = () => res();
            });

      return settled.then(() =>
        typeof img.decode === "function" ? img.decode().catch(() => {}) : undefined
      );
    }),
    console.log("waited for images, done!")
  );
  console.log("going to try entering waitForDomImages");
  waitForDomImages.then(() => {
    console.log("Going to refresh ScrollTrigger and request a frame:");
    console.log("I am going to unblock scroll after that!");
    
    requestAnimationFrame(() => {
    });
    
    
  });

  return () => {

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }


    if (lenisRef.current) {
      lenisRef.current.off("scroll", handleScroll);
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

  };    
});
  return (
    
    <section  ref={mainRef} style={{justifyContent:'stretch', display: 'flex', position: 'relative', top: '0', left: '0',overflowY:'hidden !important'}}>
      <RemoveScrollBar/>
    </section>

    
  );
}
