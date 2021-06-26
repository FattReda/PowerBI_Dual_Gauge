/*
*  Power BI Visual CLI
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

import './gauge';
import "core-js/stable";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import { gauge } from './gauge';
import { VisualSettings } from "./settings";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
export type Datatype = { x: any, y: any };

export interface GaugeRoleNames {    ////help accessing role names in dataview.
    startValue: string;
    endValue: string;
    targetValue: string;
    indicatorValue: string;
}

export class Visual implements IVisual {

    private svg: Selection<SVGElement>;
    private container: Selection<SVGElement>;
    private gaugeContainer: Selection<SVGElement>;
    private startValue: number;
    private targetValue: number;
    private indicatorValue: number;
    private endValue: number;
    private alert: Selection<SVGElement>;
    private textValue1: Selection<SVGElement>;
    private rect1: Selection<SVGElement>;
    private textLabel1: Selection<SVGElement>;
    private textValue2: Selection<SVGElement>;
    private textLabel2: Selection<SVGElement>;
    private rect2: Selection<SVGElement>;
    private visualSettings: VisualSettings;

    constructor(options: VisualConstructorOptions) {                      // init.
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('visuel2', true);
        this.container = this.svg.append("g")
            .classed('container', true);
        this.gaugeContainer = this.svg.append("g").attr("class", "gaugeContainer");
        this.alert = this.container.append("text")
            .classed("alert", true);
        this.rect1 = this.container.append("rect")
            .classed('rect', true);
        this.textValue1 = this.container.append("text")
            .classed("textValue", true);
        this.textLabel1 = this.container.append("text")
            .classed("textLabel", true);

        this.rect2 = this.container.append("rect")
            .classed('rect', true);
        this.textValue2 = this.container.append("text")
            .classed("textValue", true);
        this.textLabel2 = this.container.append("text")
            .classed("textLabel", true);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    public static RoleNames: GaugeRoleNames = {    //to access role names in dataview source.
        startValue: 'StartValue',
        endValue: 'EndValue',
        targetValue: 'TargetValue',
        indicatorValue: 'IndicatorValue',
    }

    public validData(startValue, targetValue, indicatorValue, endValue) {    //method to check if data is valid.
        if (!endValue || !targetValue || !indicatorValue)           // Values Existence.
            return false;
        else if (startValue >= endValue)
            return false;
        else if (targetValue < startValue || targetValue > endValue)
            return false;
        return true;
    }

    public Display_by_unit(x, decimals) {         //method to format units display.
        if (isNaN(x)) return x.toFixed(decimals);

        if (x < 9999) {
            return x.toFixed(decimals);
        }

        if (x < 1000000) {
            return Math.round(x.toFixed(decimals) / 1000) + "K";
        }
        if (x < 10000000) {
            return (x.toFixed(decimals) / 1000000).toFixed(2) + "M";
        }

        if (x < 1000000000) {
            return Math.round((x.toFixed(decimals) / 1000000)) + "M";
        }

        if (x < 1000000000000) {
            return Math.round((x.toFixed(decimals) / 1000000000)) + "B";
        }
        return "1T+";
    }

    public getValue(values, rolename) {    //method to get data.
        for (let i = 0; i < values.length; i++) {
            let source = values[i].source;
            let value: number = <number>values[i].values[0];
            value = value === null ? undefined : value;
            if (source && source.roles) {
                if (source.roles[rolename]) {
                    if (value === undefined || isNaN(Number(value)))    //in case
                        return value;
                    return value;
                }
            }
        }
    }

    public getValueString(values, rolename) {  //method to get data display Name
        for (let i = 0; i < values.length; i++) {
            let source = values[i].source;
            if (source && source.roles) {
                if (source.roles[rolename]) {
                    return source.displayName;
                }
            }
        }
    }
    
    public getPercentTargetEndValue(values) {   //method to get percentage target / End Value.
        return ((this.getValue(values, Visual.RoleNames.targetValue) / this.getValue(values, Visual.RoleNames.endValue)) * 100).toFixed(2)
    }

    public getPercentPointerEndValue(values) {  //method to get percentage pointer / End Value.
        return ((this.getValue(values, Visual.RoleNames.indicatorValue) / this.getValue(values, Visual.RoleNames.endValue)) * 100).toFixed(2)
    }

    public changeBackground(bElement, bUrl) {   //method to import image from url and size configure.
        bElement.style.backgroundSize = "cover";
        return bElement.style.backgroundImage = "url(" + bUrl + ")";
    }

    public preloadImage() {     //method to load image.
        this.changeBackground(document.body, this.visualSettings.backgroundSettings.imageURL);
    }

    public removeimage() {      //remove image.
        this.container.select("image").remove();
    }

    public update(options: VisualUpdateOptions) {
        //Dial gauge when changing size issue fix. 
        this.container.selectAll("circle").remove();
        //Pointer Value when changing issue fix.
        this.gaugeContainer.selectAll("*").remove();

        //To Fetch Data.
        let dataViews = options.dataViews;
        let categorical = dataViews[0].categorical;
        let values = categorical.values;

        //Store entry data values.
        this.startValue = this.getValue(values, Visual.RoleNames.startValue);
        this.targetValue = this.getValue(values, Visual.RoleNames.targetValue);
        this.indicatorValue = this.getValue(values, Visual.RoleNames.indicatorValue);
        this.endValue = this.getValue(values, Visual.RoleNames.endValue);

        //Get width and height.
        let width: number = options.viewport.width;
        let height: number = options.viewport.height;
        this.svg.attr("width", width);
        this.svg.attr("height", height);

        //Check data validity.
        if (!this.validData(this.startValue, this.targetValue, this.indicatorValue, this.endValue)) {
            this.alert
                .text("Not Enough Data !")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .style("font-family", "\"Segoe UI\", wf_segoe-ui_normal, helvetica, arial, sans-serif")
                .style("font-size", 30)
            return;
        }

        //Data valid = remove alert.
        this.alert.remove();
        this.visualSettings = VisualSettings.parse<VisualSettings>(dataViews[0]);

        //Dial gauge config to load.
        var config =
        {
            label: this.visualSettings.gauge.label,
            width: width,
            height: height,
            size: (!this.visualSettings.gauge.autoSize) ? this.visualSettings.gauge.size : height - height / 3,
            min: this.startValue,
            pointerValue: this.indicatorValue,
            max: this.endValue,
            minorTicks: this.visualSettings.gauge.minorTicks,
            range1: [{ from: (undefined != this.startValue ? this.startValue : 0), to: this.targetValue }],
            range2: [{ from: this.targetValue, to: this.endValue }]
        }

        //Instance Create.
        let dialGauge = new gauge("GaugeContainer", config, this.container, this.gaugeContainer, this.visualSettings);

        //dial Gauge Render.
        dialGauge.render();

        //Pointer Path 0 to indicator value (pointer value).
        dialGauge.redraw(this.indicatorValue, 1000);

        //Background Fill Configuration. "Fixed Color Fill Show before Preload Image"
        document.body.style.background = (this.visualSettings.backgroundSettings.show && !(this.visualSettings.backgroundSettings.showImage && this.visualSettings.backgroundSettings.imageURL)) ? this.visualSettings.backgroundSettings.backgroundColor : "none";                        // fill settings
        (this.visualSettings.backgroundSettings.showImage && this.visualSettings.backgroundSettings.imageURL && this.visualSettings.backgroundSettings.show) ? this.preloadImage() : this.removeimage();

        //Hiding Ticks => Hiding Minors Labels.
        this.visualSettings.gauge.showMinor = (this.visualSettings.gauge.showTicks) ? this.visualSettings.gauge.showMinor : false;

        //Hiding Text Values Settings => Hiding Text Labels Settings.
        this.visualSettings.textLabelSettings.show = (this.visualSettings.textValuesSettings.show) ? this.visualSettings.textLabelSettings.show : false;

        //Setting up Text Label and Text Values.
        let fontSizeValue: number = Math.min(width, height) / 5;
        let fontSizeLabel: number = fontSizeValue / 4;
        
        //Store String For Better Code Visibility
        let label1 = `% ${this.getValueString(values,Visual.RoleNames.targetValue)}/${this.getValueString(values,Visual.RoleNames.endValue)}`;
        let label2 = `% ${this.getValueString(values,Visual.RoleNames.indicatorValue)}/${this.getValueString(values,Visual.RoleNames.endValue)}`
        
        this.textValue1
            .text((this.visualSettings.textValuesSettings.show) ? this.getPercentTargetEndValue(values) + "%" : "")
            .attr("x", "25%")
            .attr("y", "75%")
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("fill", this.visualSettings.textValuesSettings.color)
            .style("font-family", this.visualSettings.textValuesSettings.fontFamily)
            .style("font-size", (this.visualSettings.textValuesSettings.change_font) ? this.visualSettings.textValuesSettings.fontSize : "4vw")
            .style("font-style", this.visualSettings.textValuesSettings.isItalic === true ? "italic" : "normal")
            .style("font-weight", this.visualSettings.textValuesSettings.isBold === true ? "bold" : "normal")
        this.textLabel1
            .text((this.visualSettings.textLabelSettings.label1) ?  this.visualSettings.textLabelSettings.label1 : ((this.visualSettings.textLabelSettings.change) ? "% Target/End Value" : label1))
            .attr("x", "25%")
            .attr("y", "75%")
            .attr("dy", fontSizeValue / 1.2)
            .attr("text-anchor", "middle")
            .style("fill", (this.visualSettings.textLabelSettings.show && this.visualSettings.textValuesSettings.show) ? this.visualSettings.textLabelSettings.color : "none")
            .style("font-family", this.visualSettings.textLabelSettings.fontFamily)
            .style("font-size", (this.visualSettings.textLabelSettings.change_font) ? this.visualSettings.textLabelSettings.fontSize : fontSizeLabel + "px")
            .style("font-style", this.visualSettings.textLabelSettings.isItalic === true ? "italic" : "normal")
            .style("font-weight", this.visualSettings.textLabelSettings.isBold === true ? "bold" : "normal")
        this.rect1
            .style("fill", (this.visualSettings.rect.show) ? this.visualSettings.rect.rectangleColor : "none")
            .style("fill-opacity", 1 - this.visualSettings.rect.transparency / 100)
            .style("stroke", "black")
            .style("stroke-width", (this.visualSettings.rect.show) ? ((this.visualSettings.rect.rectangleThickness) ? this.visualSettings.rect.rectangleThickness : 5) : 0)
            .attr("x", "0%")
            .attr("y", "50%")
            .attr("height", "50%")
            .attr("width", "50%")
            .attr("rx", 15)
            .attr("ry", 15);
        this.textValue2
            .text((this.visualSettings.textValuesSettings.show) ? this.getPercentPointerEndValue(values) + "%" : "")
            .attr("x", "75%")
            .attr("y", "75%")
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("fill", this.visualSettings.textValuesSettings.color)
            .style("font-family", this.visualSettings.textValuesSettings.fontFamily)
            .style("font-size", (this.visualSettings.textValuesSettings.change_font) ? this.visualSettings.textValuesSettings.fontSize : "4vw")
            .style("font-style", this.visualSettings.textValuesSettings.isItalic === true ? "italic" : "normal")
            .style("font-weight", this.visualSettings.textValuesSettings.isBold === true ? "bold" : "normal")
        this.textLabel2
            .text((this.visualSettings.textLabelSettings.label2) ?  this.visualSettings.textLabelSettings.label2 : ((this.visualSettings.textLabelSettings.change) ? "% Pointer/End Value" : label2))
            .attr("x", "75%")
            .attr("y", "75%")
            .attr("dy", fontSizeValue / 1.2)
            .attr("text-anchor", "middle")
            .style("fill", (this.visualSettings.textLabelSettings.show && this.visualSettings.textValuesSettings.show) ? this.visualSettings.textLabelSettings.color : "none")
            .style("font-family", this.visualSettings.textLabelSettings.fontFamily)
            .style("font-size", (this.visualSettings.textLabelSettings.change_font) ? this.visualSettings.textLabelSettings.fontSize : fontSizeLabel + "px")
            .style("font-style", this.visualSettings.textLabelSettings.isItalic === true ? "italic" : "normal")
            .style("font-weight", this.visualSettings.textLabelSettings.isBold === true ? "bold" : "normal")
        this.rect2
            .style("fill", (this.visualSettings.rect.show) ? this.visualSettings.rect.rectangleColor : "none")
            .style("fill-opacity", 1 - this.visualSettings.rect.transparency / 100)
            .style("stroke", "black")
            .style("stroke-width", (this.visualSettings.rect.show) ? ((this.visualSettings.rect.rectangleThickness) ? this.visualSettings.rect.rectangleThickness : 5) : 0)
            .attr("x", "50%")
            .attr("y", "50%")
            .attr("height", "50%")
            .attr("width", "50%")
            .attr("rx", 15)
            .attr("ry", 15);

        //AboutSettings    
        this.visualSettings.aboutSettings.version = "3.1";
        this.visualSettings.aboutSettings.helpUrl = "https://cutt.ly/SfjY4An";

    }
}

