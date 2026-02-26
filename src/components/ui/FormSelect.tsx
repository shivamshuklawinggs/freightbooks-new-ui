import React from 'react';
import Select, {
  Props as SelectProps,
  StylesConfig,
  components,
  MenuListProps,
  GroupBase,
  OptionsOrGroups,
} from 'react-select';
import { Box, Typography } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps<SelectOption, false, GroupBase<SelectOption>>, 'options'> {
  label?: string;
  error?: string;
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  helperText?: string;
  required?: boolean;
  addNewLabel?: string;
  addNewModal?: React.ReactNode;
  showModal?: boolean;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  options,
  helperText,
  required,
  styles,
  addNewLabel,
  addNewModal,
  showModal,
  setShowModal,
  ...selectProps
}) => {
  const handleAddNewClick = () => {
    setShowModal && setShowModal(true);
  };
  const CustomMenuList = (props: MenuListProps<SelectOption, false, GroupBase<SelectOption>>) => {
    return (
      <components.MenuList {...props}>
        {addNewLabel && (
          <Box
            onClick={handleAddNewClick}
            sx={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #e0e0e0',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography color="primary" sx={{ fontWeight: 500 }}>
              {addNewLabel}
            </Typography>
          </Box>
        )}
        {props.children}
      </components.MenuList>
    );
  };
  const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderColor: error ? '#d32f2f' : state.isFocused ? '#1976d2' : base.borderColor,
      boxShadow: error
        ? '0 0 0 1px #d32f2f'
        : state.isFocused
        ? '0 0 0 1px #1976d2'
        : base.boxShadow,
      '&:hover': {
        borderColor: error ? '#d32f2f' : state.isFocused ? '#1976d2' : '#b0b0b0',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    ...styles,
  };

  return (
    <>
      <Box>
        {label && (
          <Typography
            variant="caption"
            color={error ? 'error' : 'textSecondary'}
            sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}
          >
            {label}
            {required && (
              <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                *
              </Typography>
            )}
          </Typography>
        )}
        <Select<SelectOption, false, GroupBase<SelectOption>>
          options={options}
          styles={customStyles}
          menuPortalTarget={document.body}
          components={addNewLabel ? { MenuList: CustomMenuList } : undefined}
          {...selectProps}
        />
        {(error || helperText) && (
          <Typography
            variant="caption"
            color={error ? 'error' : 'textSecondary'}
            sx={{ mt: 0.5, display: 'block', ml: 1.5 }}
          >
            {error || helperText}
          </Typography>
        )}
      </Box>
      {addNewModal}
    </>
  );
};

export default FormSelect;
