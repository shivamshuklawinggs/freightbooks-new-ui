import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from '.';
import Layout from '@/components/common/layout/Layout';
import { paths } from '@/utils/paths';
import { ActionType, ResourceType, RoteExtended } from '@/types';
import { ProtectedRoute, useAuth } from '@/hooks/ProtectedRoute/authUtils';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import LoadingSpinner from '@/components/common/LoadingSpinner';


interface Route {
  path: string;
  element?: React.LazyExoticComponent<React.FC> | React.FC;
  title: string;
  icon?: string;
  key: string;
  icontype?: string;
  hideInMenu?: boolean;
  children?: Route[];
  action?: ActionType;
  resource: ResourceType[];
}

// Recursive function to render routes
const renderRoutes = (routes: Route[]): React.ReactNode[] => {

  return routes.map(route => {
    // Create the route element with protection and suspense
    const RouteElement = () => (
      <ProtectedRoute
        // Default to 'view' action if not specified
        action={route.action || 'view'}
        // Use the resource from the route, or fall back to the key
        resource={route.resource}
      >
        <Suspense fallback={null}>
          {route.element && <route.element />}
        </Suspense>
      </ProtectedRoute>
    );

    // If the route has children, recursively render them
    if (route.children) {
      return [
        // Render the parent route if it has an element
        route.element && (
          <Route
            key={route.path}
            path={route.path}
            element={<RouteElement />}
          />
        ),
        // Recursively render child routes
        ...renderRoutes(route.children)
      ].filter(Boolean) as React.ReactNode[]; // Filter out undefined elements (when parent has no element)
    }

    // Render a single route
    return (
      <Route
        key={route.path}
        path={route.path}
        element={<RouteElement />}
      />
    );
  });
};


const renderPublicRoutes = (routes: RoteExtended[]): React.ReactNode[] => {
  return routes.map(({ path, element: Element }) => (
    <Route
      key={path}
      path={path}
      element={
        <Suspense fallback={null}>
          {Element && <Element />}
        </Suspense>
      }
    />
  ));
};

const RouterConfig: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
   useAuth();
 if (!user.initialized) {
    // Show loader until API completes (fulfilled or rejected)
    return (
     <LoadingSpinner sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}/>
    );
  }
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Public Routes */}
        {renderPublicRoutes(publicRoutes as RoteExtended[])}

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute action='view' resource={['layout']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {renderRoutes(protectedRoutes as Route[])}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={paths.notfound} replace />} />
      </Routes>
    </Suspense>
  );
};

export default RouterConfig;
