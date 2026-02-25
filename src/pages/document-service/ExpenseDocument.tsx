import React, { useState, useMemo, useEffect } from 'react'
import { TableRow, TableCell, Stack, Chip, IconButton, Select, MenuItem, FormControl } from '@mui/material';
import { IDocument, IFile, IitemService } from '@/types';
import { handleFileDownload } from '@/utils';
import { Checkbox } from '@mui/material';
import ViewIcon from '@mui/icons-material/RemoveRedEye';
import Download from '@mui/icons-material/Download';

const ExpenseDocument = ({data,selectedDocuments,setSelectedDocuments,file,setFile}: {data: IDocument[],selectedDocuments: IFile[],setSelectedDocuments: React.Dispatch<React.SetStateAction<IFile[]>>,file: IFile | null,setFile: React.Dispatch<React.SetStateAction<IFile | null>>}) => {
      const [selectedExpense, setSelectedExpense] = useState<string>('');
      
    // Get unique expense types
const uniqueExpenses: IitemService[] = useMemo(() => {
    const seen = new Set();
    const unique = data.filter(doc => {
      if (!doc.service._id) return false;
      if (seen.has(doc.service._id)) return false;
      seen.add(doc.service._id);
      return true;
    });
    return unique.map(doc => doc.service);
  }, [data]);
  

      // Filter documents based on selected expense
      const filteredData = useMemo(() => {
        return data.filter(doc => doc.service._id === selectedExpense);
      }, [selectedExpense]);

      const handleCheckboxChange = (document: IFile) => {
        setSelectedDocuments(prev => {
          const isSelected = prev.some(doc => doc.filename === document.filename);
          if (isSelected) {
            return prev.filter(doc => doc.filename !== document.filename);
          } else {
            return [...prev, document];
          }
        });
      };

      const handleFileOpen = (document: IFile) => {
        setFile(document);
      };

  
useEffect(() => {
    if(uniqueExpenses.length>0){
        let expenseId = uniqueExpenses[0]._id;
        expenseId && setSelectedExpense(expenseId);
    }
    
}, [uniqueExpenses]);
  return (
    <>
    {uniqueExpenses.length>0 && (
       <FormControl sx={{ m: 1, minWidth: 120 }}>
        <Select
          value={selectedExpense}
          onChange={(e) => setSelectedExpense(e.target.value)}
          size="small"
        >
          {uniqueExpenses.map((expense) => (
            <MenuItem key={expense._id} value={expense._id}>
              {expense.label}
            </MenuItem>
          ))}
        </Select>
                </FormControl>
    )}
      {filteredData.map((document: IDocument) => {
            const files = document?.file
            return (
              <TableRow key={document._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedDocuments.some(doc => doc.filename === files?.filename)}
                    onChange={() => handleCheckboxChange(files as IFile)}
                  />
                </TableCell>
                <TableCell>
                 {selectedExpense === document.service._id && (
                  <Chip
                    label={document.service.label }
                    size="small"
                    variant="outlined"
                  />
                 )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={files?.originalname || 'No file'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="right">
                    <IconButton
                      size="small"
                      onClick={() => handleFileOpen(files as IFile)}
                      disabled={!files}
                    >
                      <ViewIcon  color='primary'/>
                    </IconButton>
                    <IconButton
                      size="small"
                      color='primary'
                      onClick={() => handleFileDownload(files as IFile, files?.url as string)}
                      disabled={!files}
                    >
                      <Download />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
          </>
   
   
  )
}

export default ExpenseDocument