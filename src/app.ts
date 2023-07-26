import * as express from 'express'
import * as fs from 'fs';
import * as cors from 'cors'

import { Stock, Transaction, ResultingStock } from './interfaces';

const app = express()

app.use(cors())

const fetchStockData = async (sku: string): Promise<Stock[]> => {
  const rawData = await fs.promises.readFile('./data/stocks.json', 'utf-8');
  const stockData: Stock[] = JSON.parse(rawData)
  const stock = stockData.filter(stock => stock.sku === sku)
  return stock
}

const applyTransaction = async (sku: string, stock: number): Promise<{ sku: string, qty: number }> => {
    const rawData = await fs.promises.readFile('./data/transactions.json', 'utf-8');
    const transactions: Transaction[] =  JSON.parse(rawData);
    const relevantTransactions: Transaction[] = transactions.filter(transaction => transaction.sku === sku)
    if(!relevantTransactions.length){
        return {
            sku,
            qty: 0
        }
    } 
    let qty: number = stock
    relevantTransactions.map(transaction => {
        if(transaction.type === 'order') {
            qty -= transaction.qty
        } else if(transaction.type === 'refund'){
            qty += transaction.qty
        }
    })
    const resultStock: ResultingStock = {
      sku,
      qty  
    }
    return resultStock
}

export const getStockLevel = async (sku: string) : Promise<ResultingStock> => {
        const stockLevels: Stock[] = await fetchStockData(sku);
        if(stockLevels.length){
            const stockLevel: Stock = stockLevels[0]
            const resultingStock: ResultingStock = await applyTransaction(stockLevel.sku, stockLevel.stock)
            if(!resultingStock.qty){
                throw new Error('No transaction matched')
            }
            return resultingStock
        } else {
            return {
                sku,
                qty: 0
            }
        }
}

app.get("/sku", async (req, res) => {
    try{
        const sku = req.query.sku as string
        const resultingStock: ResultingStock = await getStockLevel(sku)
        if(resultingStock.qty){
            res.status(200).json({status: 'success', data: resultingStock, message: 'Resulting Stock'});
        } else {
            res.status(404).json({status: 'failure', data: resultingStock, message: 'Stock not found'});
        }
    } catch(error) {
        console.log('error', error)
        const errMessage = error.message || 'Internal Server Error'
        res.status(500).json({status:'failure', message: `Error: ${errMessage}`})
    }
  });

export default app;