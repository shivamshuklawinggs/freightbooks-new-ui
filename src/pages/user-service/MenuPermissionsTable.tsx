import React from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import { IUser, ResourceType, Role } from "@/types";
import { MenuTitles, defaulUsertValues } from './Schema/userSchema';

export type ActionType = "view" | "create" | "update" | "delete" | "import" | "export";

export interface FilterOption {
  resource: ResourceType[];
  hideActions?: ActionType[];
  hideMenu?: boolean;
}

const allActions: ActionType[] = ["view", "create", "update", "delete", "import", "export"];

const roleFilterOptions: Record<Role, FilterOption[]> = {
  dispatcher: [ ],
  accountant: [],
  admin: [],
  manager: [],
  superadmin: []
};

const MenuPermissionsTable: React.FC = () => {
  const { watch, register, setValue } = useFormContext<IUser>();
  const role = watch("role") as Role;

  type MenuKey = keyof IUser['menuPermission'];
  type PermissionKey = keyof IUser['menuPermission'][MenuKey]['permissions'];

  const menuRoutes: { title: string; path: MenuKey }[] = Object.keys(defaulUsertValues.menuPermission).map((key) => ({
    title: MenuTitles[key as MenuKey],
    path: key as MenuKey,
  }));

  const filterOptions = role ? roleFilterOptions[role] : [];

  const shouldHideAction = (resource: MenuKey, action: PermissionKey) => {
    const option = filterOptions.find(f => f.resource.includes(resource));
    return option?.hideActions?.includes(action as ActionType);
  };

  const shouldHideMenu = (resource: MenuKey) => {
    const option = filterOptions.find(f => f.resource.includes(resource));
    return option?.hideMenu;
  };

  const allpermission = () =>
    menuRoutes.every(route =>
      allActions.every(perm =>
        !shouldHideAction(route.path, perm as PermissionKey)
          ? watch(`menuPermission.${route.path}.permissions.${perm}` as const)
          : true
      )
    );

  const addAllMenus = () => {
    const all = allpermission();
    menuRoutes.forEach(route => {
      allActions.forEach(perm => {
        if (!shouldHideAction(route.path, perm as PermissionKey)) {
          setValue(`menuPermission.${route.path}.permissions.${perm}` as const, !all);
        }
      });
    });
  };

  return (
    <Box mt={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">Menu Permissions</Typography>
        <Button onClick={addAllMenus} variant="outlined" size="small">
          {allpermission() ? "Clear" : "Grant"} All Permissions
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Menu</TableCell>
              {allActions.map((action) => (
                <TableCell align="center" key={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {menuRoutes
              .filter(route => !shouldHideMenu(route.path))
              .map(route => (
              <TableRow key={route.path}>
                <TableCell sx={{ textTransform: "capitalize" }}>{route.title}</TableCell>
                {allActions.map(action => {
                  const permKey = action as PermissionKey;
                  const fieldPath = `menuPermission.${route.path}.permissions.${permKey}` as const;

                  return shouldHideAction(route.path, permKey) ? (
                    <TableCell key={action} align="center" sx={{ opacity: 0.3 }}>
                      —
                    </TableCell>
                  ) : (
                    <TableCell key={action} align="center">
                      <Checkbox
                        {...register(fieldPath)}
                        checked={watch(fieldPath)}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MenuPermissionsTable;
