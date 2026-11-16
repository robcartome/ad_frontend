'use client';
import { createContext, useContext } from 'react';
export const WebsiteMediaContext = createContext(null);
export const useWebsiteMedia = () => useContext(WebsiteMediaContext);
