import { Role, ActionType, ResourceType, PermissionCheck } from '@/types';
import { UserState, logout } from '@/redux/Slice/UserSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';
import { paths } from '@/utils/paths';
import { fetchCurrentCompany, fetchCurrentUser } from '@/redux/api';

interface RouteProps {
  children: React.ReactNode;
  action: ActionType;
  resource: ResourceType[];
}

// =============================================================================
// 2. USER PERMISSION CHECKER CLASS (CUSTOM IMPLEMENTATION)
// =============================================================================

export class UserPermissionChecker {
  private user: UserState;

  constructor(user: UserState) {
    this.user = user;
  }

  /**
   * Checks if the user has a specific permission for a given resource.
   */
  hasPermission(action: ActionType, resource: ResourceType[]): boolean {
    // All authenticated users can see the main layout and dashboard.
    if (resource.includes('layout')) {
      return true;
    }
    if (resource.includes("dashboard") && this.user?.user?.role === Role.SUPERADMIN ) {
      return false ;
    }
    if (resource.includes("dashboard") && this.user?.user?.role !== Role.SUPERADMIN ) {
      return true ;
    }
    if (resource.includes("users") && this.user?.user?.role== Role.ADMIN ) {
      return true ;
    }
    // Superadmin has access only to specific routes.
    if (this.user?.user?.role === Role.SUPERADMIN) {
      return resource.includes("superadmin");
    }
    if(this.user?.user?.role ===Role.ADMIN){
      return  !resource.includes("superadmin")
    }
   
    if (this.user?.user?.role === Role.ACCOUNTANT && resource.includes('accounting')) {
      return true;
    }

    // Check permissions for each resource in the array
    const hasPermissionForAnyResource = resource.some(res => {
      const permissions = this.user?.user?.menuPermission?.[res as keyof typeof this.user.user.menuPermission]?.permissions;
      if (!permissions) {
        return false;
      }
      const checkAction = action === 'view' ? 'view' : action;
      return permissions[checkAction as keyof typeof permissions] ?? false;
    });

    return hasPermissionForAnyResource;
  }

  hasAnyPermission(checks: PermissionCheck[]): boolean {
    return checks.some(({ action, resource }) => this.hasPermission(action, resource));
  }

  hasAllPermissions(checks: PermissionCheck[]): boolean {
    return checks.every(({ action, resource }) => this.hasPermission(action, resource));
  }
}

// =============================================================================
// 3. UTILITY & ROUTE ACCESS FUNCTIONS
// =============================================================================

/**
 * A simple utility to check view access for a given route resource.
 */
export const hasAccess = (routeKey: ResourceType[], action: ActionType, user: UserState | null): boolean => {
  const unAuthtrizeAcces: ActionType[] = [
    "create",
    "delete",
    "update",
    "export",
    "import"
  ]
  if (!user) {
    return false;
  }

  const checker = new UserPermissionChecker(user as UserState);

  if (action === "view" && !user.currentCompany) {
    return checker.hasPermission(action, routeKey);
  }
  // Default to checking 'view' permission for general route access.
  if (!user.currentCompany && unAuthtrizeAcces.includes(action)) {
    return false;
  }
  return checker.hasPermission(action, routeKey);
};
// for show show or hide buttons create,delete,edit use react function  and arguement take function  and show accosrding to permission
export const HasPermission = ({ action, resource, component }: { action: ActionType, resource: ResourceType[], component: React.ReactNode }): React.ReactNode => {
  const user = useSelector((state: RootState) => state.user)
  const unAuthtrizeAcces: ActionType[] = [
    "create",
    "delete",
    "update",
    "export",
    "import"
  ]
  if (!user) {
    return null;
  }
  const checker = new UserPermissionChecker(user as UserState);

  if (!user.currentCompany && unAuthtrizeAcces.includes(action)) {
    return null;
  }
  return checker.hasPermission(action, resource) ? component : null;
};
export function withPermission(
  action: ActionType,
  resource: ResourceType[]
) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    const ComponentWithPermission = (props: P) => {
      return (
        <HasPermission
          action={action}
          resource={resource}
          component={<WrappedComponent {...props} />}
        />
      );
    };

    ComponentWithPermission.displayName = `WithPermission(${WrappedComponent.displayName || WrappedComponent.name})`;

    return ComponentWithPermission;
  };
}
/**
 *  ProtectedRoute component
 * @param param  
 * @returns 
 */
export const ProtectedRoute: React.FC<RouteProps> = ({ children, action, resource }) => {
  const user = useSelector((state: RootState) => state.user);
  const checker = new UserPermissionChecker(user);

  if (!user.isAuthenticated) {
    return <Navigate to={`${paths.login}?next=${window.location.pathname}`} replace />;
  }

  if (!checker.hasPermission(action, resource)) {
    return <Navigate to={paths.notauthorized} replace />;
  }

  return <>{children}</>;
};

/**
 *  useAuth hook
 * @returns  void
 */
export const useAuth = () => {
  const { initialized, currentCompany, } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['fetchUser', initialized],
    queryFn: () => dispatch(fetchCurrentUser()).unwrap(),
    retry: true,
    enabled: !initialized,
    refetchOnWindowFocus: false,
  });
  useQuery({
    queryKey: ['getCompany', currentCompany],
    queryFn: () => dispatch(fetchCurrentCompany({ companyId: currentCompany as string })).unwrap(),
    retry: !!currentCompany,
    enabled: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Error fetching user:', query.error);
      dispatch(logout());
      navigate(`${paths.login}?next=${window.location.pathname}`);
    }
  }, [query.isError]);

}

