import { getStockLevel } from '../src/app.ts'; 
//import {ResultingStock} from ',,/src/interfaces.ts'

describe('getStockLevel', () => {
  it('should return the correct stock level for a valid SKU', async () => {
    const sku = 'TVN783304/18/16';
    const result = await getStockLevel(sku);
    expect(result).toEqual({ sku, qty: 8067 });
  });

  it('should return stock level 0 for a SKU with no stock entry in stock.json', async () => {
    const sku = 'TVN783304/18/1'; 
    const result = await getStockLevel(sku);
    expect(result).toEqual({ sku: sku, qty: 0 });
  });

  it('should throw an error for a non-existent SKU in transactions.json', async () => {
    const sku = 'HGG795032/35/100'; // added this extra sku for testing this case
    await expect(getStockLevel(sku)).rejects.toThrow(`No transaction matched`);
  });

  it('should decrease stock quantity for order transaction', async () => {
    const sku = 'TVN783304/18/16'; // this sku has allentries for type as order in transactions.json
    const initialStockLevel = 8079; //inital stock level for the sku taken from stocks.json
    const result = await getStockLevel(sku);
    expect(result.qty).toBeLessThan(initialStockLevel);
  });

  it('should increase stock quantity for refund transaction', async () => {
    const sku = 'UTF434696/37/180'; // this sku has allentries for type as order in transactions.json
    const initialStockLevel = 4009; //inital stock level for the sku taken from stocks.json
    const result = await getStockLevel(sku);
    expect(result.qty).toBeGreaterThan(initialStockLevel);
  });

  it('should throw an error for order greater than initial stocks', async () => {
    const sku = 'UTF434696/37/181'; //new stock added by me for testing
  
    await expect(getStockLevel(sku)).rejects.toThrow(`Orders cannot be placed for qyantity greater than the stocks available`);; 
    // Ensure stock doesn't go below zero (out of stock)
  });
});
