import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Paper,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';


// Using Material UI dark theme feature
const darkTheme = createTheme({
  palette: { mode: 'dark' },
});

// Populate states dropdown for selected country
const countryStateMap = {
  USA:['California', 'Texas', 'New York', 'Florida', 'Washington' ],
  Canada: ['Ontario', 'Quebec' ],
}

const App = () => {
  const [customers, setCustomers] = useState([]); // state to hold fetched list of customers
  const [total, setTotal] = useState(0); // state to hold total count of customers

  //State to filter the customer by name,state,country
  const [search, setSearch] = useState(''); 
  const [stateFilter, setStateFilter] = useState(''); 
  const [countryFilter, setCountryFilter] = useState('');

  //pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);


  // Compute the list of states to show in the State dropdown:
  const availableStates = countryFilter
    ? countryStateMap[countryFilter]
    : // When no country is selected, show *all* states:
      Object.values(countryStateMap).flat();

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stateFilter) params.append('state', stateFilter);
      if (countryFilter) params.append('country', countryFilter);
      params.append('page', page + 1);           // Backend pages are 1-indexed
      params.append('page_size', pageSize);
      const res = await fetch(`http://localhost:8000/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data.data);
      setTotal(data.total);
    };
    fetchData();
  }, [search, stateFilter, countryFilter, page, pageSize]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleStateChange  = (e) => { setStateFilter(e.target.value); setPage(0); };
  const handleCountryChange= (e) => { setCountryFilter(e.target.value); setPage(0); };

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Container>
          <h1>Customers</h1>
          <Paper style={{ padding: 16 }}>
            {/* Search and filters */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <TextField
                label="Search" variant="filled"
                value={search} onChange={handleSearchChange}
                style={{ marginRight: 16 }}
              />
              {/* State Dropdown */}
              <FormControl variant="filled" style={{ minWidth: 120, marginRight: 16 }}>
                <InputLabel>State</InputLabel>
                <Select value={stateFilter} onChange={handleStateChange}>
                  <MenuItem value="">All</MenuItem>
                  {availableStates.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
                </Select>
              </FormControl>
              {/* Country dropdown */}
              <FormControl variant="filled" style={{ minWidth: 120 }}>
                <InputLabel>Country</InputLabel>
                <Select value={countryFilter} onChange={handleCountryChange}>
                  <MenuItem value="">All</MenuItem>
                  {Object.keys(countryStateMap).map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
                </Select>
              </FormControl>
            </div>
            {/* Data table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Country</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.state}</TableCell>
                      <TableCell>{c.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination controls */}
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10)); 
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </Container>
      </ThemeProvider>
    </>
  )
}

export default App