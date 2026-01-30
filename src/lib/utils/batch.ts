/**
 * Simple utility to process items in batches with concurrency control.
 */
export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item).catch(err => {
        console.error("Batch processing error for item:", item, err);
        return null as unknown as R;
      }))
    );
    results.push(...batchResults);
  }
  
  return results;
}
