/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { t } from '@superset-ui/core';
import cherkasy from './regions/cherkasy.geojson';
import chernihiv from './regions/chernihiv.geojson';
import chernivtsi from './regions/chernivtsi.geojson';
import dnipropetrovsk from './regions/dnipropetrovsk.geojson';
import donetsk from './regions/donetsk.geojson';
import ivano_frankivsk from './regions/ivano_frankivsk.geojson';
import kharkiv from './regions/kharkiv.geojson';
import kherson from './regions/kherson.geojson';
import khmelnytskyi from './regions/khmelnytskyi.geojson';
import kirovohrad from './regions/kirovohrad.geojson';
import kyiv from './regions/kyiv.geojson';
import luhansk from './regions/luhansk.geojson';
import lviv from './regions/lviv.geojson';
import mykolaiv from './regions/mykolaiv.geojson';
import odesa from './regions/odesa.geojson';
import poltava from './regions/poltava.geojson';
import rivne from './regions/rivne.geojson';
import sumy from './regions/sumy.geojson';
import ternopil from './regions/ternopil.geojson';
import ukraine from './regions/ukraine.geojson';
import vinnytsia from './regions/vinnytsia.geojson';
import volyn from './regions/volyn.geojson';
import zakarpattia from './regions/zakarpattia.geojson';
import zaporizhzhia from './regions/zaporizhzhia.geojson';
import zhytomyr from './regions/zhytomyr.geojson';

export const regions = {
  cherkasy,
  chernihiv,
  chernivtsi,
  dnipropetrovsk,
  donetsk,
  ivano_frankivsk,
  kharkiv,
  kherson,
  khmelnytskyi,
  kirovohrad,
  kyiv,
  luhansk,
  lviv,
  mykolaiv,
  odesa,
  poltava,
  rivne,
  sumy,
  ternopil,
  ukraine,
  vinnytsia,
  volyn,
  zakarpattia,
  zaporizhzhia,
  zhytomyr,
};

export const regionOptions = Object.keys(regions).map(regionId => {
  const regionRepr = regionId
    .split('_')
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join('-');
  return [regionId, t(regionRepr)];
});

export default regions;
