import { supabase } from '../supabase';
import { Barrel } from '../../types';

export const getBarrels = async (): Promise<Barrel[]> => {
  try {
    const { data, error } = await supabase
      .from('barrels')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id || '',
      date: row.date,
      barrelNumber: row.barrel_number,
      product: row.product,
      supplier: row.supplier,
      quantity: row.quantity,
      status: row.status,
      quantitySold: row.quantity_sold,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching barrels:', error);
    throw error;
  }
};

export const addBarrel = async (
  barrel: Omit<Barrel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Barrel> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const barrelData = {
      user_id: user?.id || null,
      date: barrel.date,
      barrel_number: barrel.barrelNumber,
      product: barrel.product,
      supplier: barrel.supplier,
      quantity: barrel.quantity,
      status: barrel.status,
      quantity_sold: barrel.quantitySold || null,
    };

    const { data, error } = await supabase
      .from('barrels')
      .insert([barrelData])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id || '',
      date: data.date,
      barrelNumber: data.barrel_number,
      product: data.product,
      supplier: data.supplier,
      quantity: data.quantity,
      status: data.status,
      quantitySold: data.quantity_sold,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error adding barrel:', error);
    throw error;
  }
};

export const updateBarrel = async (
  id: string,
  updates: Partial<Barrel>
): Promise<Barrel> => {
  try {
    const updateData: any = {};

    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.barrelNumber !== undefined) updateData.barrel_number = updates.barrelNumber;
    if (updates.product !== undefined) updateData.product = updates.product;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.quantitySold !== undefined) updateData.quantity_sold = updates.quantitySold;

    const { data, error } = await supabase
      .from('barrels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id || '',
      date: data.date,
      barrelNumber: data.barrel_number,
      product: data.product,
      supplier: data.supplier,
      quantity: data.quantity,
      status: data.status,
      quantitySold: data.quantity_sold,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error updating barrel:', error);
    throw error;
  }
};

export const deleteBarrel = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('barrels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting barrel:', error);
    throw error;
  }
};
