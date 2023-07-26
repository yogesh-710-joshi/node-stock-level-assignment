import { getStockLevel } from '../src/app.ts'; 

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
});
