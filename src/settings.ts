/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public gauge: GaugeSettings = new GaugeSettings();
  public backgroundSettings = new FillSettings();
  public textValuesSettings = new TextValuesSettings();
  public textLabelSettings = new TextLabelSettings();
  public rect: RectangleSettings = new RectangleSettings();
  public aboutSettings = new AboutSettings();
}

export class GaugeSettings {
  public label: string = "Dial Gauge";
  public autoSize: boolean = true;
  public size: number = 400;
  public decimals: string = "2";
  public showTicks: boolean = true;
  public showMinor: boolean = false;
  public minorTicks: number = 2;
  public range1Color: string ="109618";
  public range2Color: string = "#DC3912";
  public pointerColor: string ="#DC3912";
  public mainCircleColor: string = "#fff";
  public centralCircleColor: string = "#4684EE";
  public borderColor: string = "#ccc";
}
export class FillSettings {
  public show: boolean = false;
  public backgroundColor: string = "#808080";
  public showImage: boolean = false;
  public imageURL: string = null;
}

export class TextValuesSettings {
  public show: boolean = true;
  public color: string = "#333333";
  public change_font: boolean = true;
  public fontSize: number = 45;
  public fontFamily: string = "wf_standard-font, helvetica, arial, sans-serif";
  public isBold: boolean = false;
  public isItalic: boolean = false;
}

export class TextLabelSettings {
  public show: boolean = true;
  public change: boolean = false;
  public label1: string = "";
  public label2: string = "";
  public color: string = "#a6a6a6";
  public change_font: boolean = false;
  public fontSize: number = 30;
  public fontFamily: string = "\"Segoe UI\", wf_segoe-ui_normal, helvetica, arial, sans-serif";
  public isBold: boolean = false;
  public isItalic: boolean = false;
}

export class RectangleSettings {
  public show: boolean = false;
  public rectangleColor: string = "LightGray";
  public transparency: number = 0.5;
  public rectangleThickness: number = 5;
}

export class AboutSettings {
  public version: string = "1.0";
  public helpUrl: string = "https://cutt.ly/SfjY4An";
}