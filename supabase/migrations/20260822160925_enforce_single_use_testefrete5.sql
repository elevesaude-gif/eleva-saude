create unique index orders_testefrete5_single_use_idx
  on public.orders ((upper(coupon_code)))
  where upper(coupon_code) = 'TESTEFRETE5';
