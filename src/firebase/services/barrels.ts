import { createClient } from '@supabase/supabase-js';
import { Barrel } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getBarrels = async (): Promise<Barrel[]> => {
  try {
    const { data, error } = await supabase
      .from('barrels')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      date: item.date,
      barrelNumber: item.barrel_number,
      product: item.product,
      supplier: item.supplier,
      quantity: item.quantity,
      status: item.status,
      quantitySold: item.quantity_sold,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching barrels:', err);
    throw err;
  }
};

export const addBarrel = async (
  barrel: Omit<Barrel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Barrel> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const barrelData = {
      user_id: user.id,
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
      userId: data.user_id,
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
  } catch (err) {
    console.error('Error adding barrel:', err);
    throw err;
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

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('barrels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
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
  } catch (err) {
    console.error('Error updating barrel:', err);
    throw err;
  }
};

export const deleteBarrel = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('barrels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting barrel:', err);
    throw err;
  }
};
