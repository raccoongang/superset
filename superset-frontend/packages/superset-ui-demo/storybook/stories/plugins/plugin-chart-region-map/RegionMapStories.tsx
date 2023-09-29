/**
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
import { useEffect, useState } from 'react';
import {
  JsonObject,
  seedRandom,
  SuperChart,
  SequentialD3,
  useTheme,
} from '@superset-ui/core';
import RegionMapChartPlugin, {
  regions,
} from '@superset-ui/plugin-chart-region-map';

import { withResizableChartDemo } from '../../../shared/components/ResizableChartDemo';

new RegionMapChartPlugin().configure({ key: 'region-map' }).register();

export default {
  title: 'Chart Plugins/plugin-chart-region-map',
  decorators: [withKnobs, withResizableChartDemo],
  component: SuperChart,
  parameters: {
    initialSize: { width: 500, height: 300 },
  },
};

function generateData(geojson: JsonObject) {
  return geojson.features.map(feat => ({
    metric: Math.round(seedRandom() * 10000) / 100,
    district_id: feat.properties.shapeName,
  }));
}

export const basic = function BasicRegionMapStory({ width, height }) {
  const theme = useTheme();
  const region = select('Region', Object.keys(regions!), 'france');
  const colorSchema = select<any>(
    'Color schema',
    SequentialD3,
    SequentialD3.find(x => x.id === 'schemeOranges'),
  );
  const [data, setData] = useState<JsonObject>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetch(regions[region], { signal })
      .then(resp => resp.json())
      .then(geojson => {
        setData(generateData(geojson));
      });
    return () => {
      controller.abort();
    };
  }, [region]);

  if (!data) {
    return (
      <div
        style={{
          color: theme.colors.grayscale.base,
          textAlign: 'center',
          padding: 20,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <SuperChart
      chartType="region-map"
      width={width}
      height={height}
      queriesData={[{ data }]}
      formData={{
        linearColorScheme: colorSchema.id,
        numberFormat: '.3s',
        selectRegion: region,
      }}
    />
  );
};
