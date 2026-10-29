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
import { JsonObject, seed, SuperChart, SequentialD3 } from '@superset-ui/core';
import { useTheme } from '@apache-superset/core/theme';
import RegionMapChartPlugin, {
  regions,
} from '@superset-ui/plugin-chart-region-map';
import { withResizableChartDemo } from '@storybook-shared';

new RegionMapChartPlugin().configure({ key: 'region-map' }).register();

export default {
  title: 'Chart Plugins/plugin-chart-region-map',
  decorators: [withResizableChartDemo],
  component: SuperChart,
  parameters: {
    initialSize: { width: 500, height: 300 },
  },
};

function generateData(geojson: JsonObject) {
  return geojson.features.map(
    (feat: { properties: { shapeName: string } }) => ({
      metric:
        Math.round(Number(seed(feat.properties.shapeName)()) * 10000) / 100,
      district_id: feat.properties.shapeName,
    }),
  );
}

export const BasicRegionMapStory = ({
  region,
  colorSchema,
  width,
  height,
}: {
  region: string;
  colorSchema: string;
  width: number;
  height: number;
}) => {
  const theme = useTheme();
  const [data, setData] = useState<JsonObject>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetch(regions[region as keyof typeof regions], { signal })
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
          color: theme.colorTextLabel,
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
        linearColorScheme: colorSchema,
        numberFormat: '.3s',
        selectRegion: region,
      }}
    />
  );
};

BasicRegionMapStory.args = {
  region: 'kyiv',
  colorSchema: 'schemeOranges',
};
BasicRegionMapStory.argTypes = {
  region: {
    control: 'select',
    options: Object.keys(regions),
  },
  colorSchema: {
    control: 'select',
    options: SequentialD3.map(x => x.id),
    description: 'Choose a color schema',
    defaultValue: 'schemeOranges',
  },
};
