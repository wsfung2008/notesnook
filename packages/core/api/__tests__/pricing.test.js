/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import Pricing from "../pricing";

test.each(["monthly", "yearly", undefined])(`get %s price`, async (period) => {
  const pricing = new Pricing();
  const price = await pricing.price(period);
  expect(price).toMatchSnapshot(`${period || "monthly"}-pricing`);
});

describe.each(["android", "ios", "web"])(`get %s pricing tier`, (platform) => {
  test.each(["monthly", "yearly"])(
    `get %s ${platform} tier`,
    async (period) => {
      const pricing = new Pricing();
      const price = await pricing.sku(platform, period);
      expect(price).toMatchSnapshot(`${period}-${platform}-pricing`);
    }
  );
});
