export const SidebarMenus=[
    {
        "path": "/",
        "title": "Dashboard",
        "icon": "dashboard",
        "icontype": "md",
        "currentCompany": false,
    },
    {
        "path": "/loads",
        "title": "Loads",
        "icon": "truck",
        "currentCompany": true,
    },
    {
        "path": "/dispatcher",
        "title": "Dispatcher",
        "icontype": "md",
        "icon": "OutlineSend",
        "currentCompany": true,
    },
    {
        "path": "/customers",
        "title": "Customers",
        "currentCompany": true,
        "icon": "customers",
    },
    {
        "path": "/carriers",
        "title": "Carriers",
        "currentCompany": true,
        "icon": "carriers",
    },
    {
        "path": "/documents",
        "title": "Documents",
        "icon": "file",
        "currentCompany": true,
    },
    {
        "path": "/expensefeeslist",
        "title": "Expense Service",
        "currentCompany": true,
        "icon": "AttachMoneyIcon",
      
    },
    {
        "path": "/accounting",
        "title": "Accounting",
        "icon": "accountBalanceWallet",
        "icontype": "md",
        "currentCompany": true,
       
        "children": [
            {
                "title": "Sales",
                "path": "/sales",
                "icon": "sales",
                "children": [
                    {
                        "path": "/invoices",
                     
                        "title": "Invoices",
                        "icon": "invoices",
                        "currentCompany": true,
                      
                    },
                    {
                        "path": "/estimates",
                    
                        "title": "Estimates",
                        "icon": "estimates",
                        "currentCompany": true,
                     
                    },
                    {
                        "path": "/accounts/customers",
                      
                        "title": "Customers",
                        "icon": "customers",
                        "currentCompany": true,
                    },
                    {
                        "path": "/accounts/recievedpayment",
                        "title": "Recieve Payment",
                        "icon": "amazonPay",
                        "currentCompany": true,
                    }
                ]
            },
            {
                "title": "Purchase",
                "path": "/purchase",
                "icon": "purchase",
                "children": [
                    {
                        "path": "/vendors",
                        "title": "Vendors",
                        "icon": "vendors",
                        "currentCompany": true,
                    },
                    {
                        "path": "/bills",
                        "title": "Bills",
                        "icon": "bills",
                        "currentCompany": true,
                    },
                    {
                        "path": "/accounts/recievedbill",
                        "title": "Bill Payment",
                        "icon": "amazonPay",
                        "currentCompany": true,
                    }
                ]
            },
            {
                "path": "/payment-terms",
                "title": "Payment Terms",
                "currentCompany": true,
                "icon": "amazonPay",
            },
            {
                "path": "/taxoptions",
                "title": "Tax Rate",
                "icon": "tax",
                "currentCompany": true,
               
            },
            {
                "path": "/productservices",
                "title": "Product Services",
                "icon": "product",
                "currentCompany": true,
            }
        ]
    },
    {
        "path": "/chart-accounts",
        "title": "Chart Of Accounts",
        "icon": "chartAccounts",
        "currentCompany": true,
       
    },
    {
        "path": "/journalentry",
        "title": "Journal Entry",
        "currentCompany": true,
        "icon": "journalEntry",
    }
]