import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  // No animations - instant page load
  return <div>{children}</div>;
};

export default PageTransition;
