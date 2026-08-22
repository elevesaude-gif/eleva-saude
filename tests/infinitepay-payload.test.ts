import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInfinitePayFiscalItems,
  INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION,
  type InfinitePayItem,
} from "../src/lib/infinitepay.ts";

test("substitui todos os nomes reais sem alterar quantidade, preço ou total", () => {
  const sourceItems: InfinitePayItem[] = [
    { description: "Tirzec 15", quantity: 2, price: 62_500 },
    { description: "Peptídeo Premium X", quantity: 1, price: 34_900 },
    { description: "Frete - Transportadora Expresso", quantity: 1, price: 2_350 },
  ];

  const fiscalItems = buildInfinitePayFiscalItems(sourceItems);
  const total = (items: InfinitePayItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serializedPayload = JSON.stringify({ items: fiscalItems });

  assert.equal(fiscalItems.length, sourceItems.length);
  assert.ok(fiscalItems.every((item) => item.description === INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION));
  assert.deepEqual(fiscalItems.map(({ quantity, price }) => ({ quantity, price })), sourceItems.map(({ quantity, price }) => ({ quantity, price })));
  assert.equal(total(fiscalItems), total(sourceItems));
  assert.doesNotMatch(serializedPayload, /Tirzec|Peptídeo|Transportadora|Expresso/);
  assert.equal(sourceItems[0].description, "Tirzec 15", "a lista interna não deve ser modificada");
});
