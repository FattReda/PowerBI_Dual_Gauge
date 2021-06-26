import * as d3 from "d3";
import { Visual } from "./visual";
export type Datatype = { x: any, y: any };

export function gauge(placeholdername, configuration, container,Element, VisualSettings) {
    this.placeholdername = placeholdername;

    var self = this; // for internal d3 functions.

    this.configure = function (configuration)           // Configuration / load config.
    {
        this.config = configuration;

        this.config.size = this.config.size * 0.9;

        this.config.radius = this.config.size * 0.97 / 2;
        this.config.cx = this.config.size / 2;
        this.config.cy = this.config.size / 2;

        this.config.min = undefined != configuration.min ? configuration.min : 0;
        this.config.range = this.config.max - this.config.min;

        this.config.majorTicks = configuration.majorTicks || 5;    //Separators.
        this.config.minorTicks = configuration.minorTicks || 2;

        this.config.range1color = VisualSettings.gauge.range1Color;
        this.config.range2color = VisualSettings.gauge.range2Color;

        this.config.mainCircleColor = VisualSettings.gauge.mainCircleColor;
        this.config.centralCircleColor = VisualSettings.gauge.centralCircleColor;
        this.config.borderColor = VisualSettings.gauge.borderColor;

        this.config.transitionDuration = configuration.transitionDuration || 500;
    }

    this.render = function () {
        Element.select("#" + this.placeholdername)               // Render Dial Gauge
            .append("svg:svg")
            .attr("class", "gauge")
            .attr("width", this.config.size)
            .attr("height", this.config.size);
        
        //Largest Circle.
        container.append("svg:circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", this.config.radius)
            .style("fill", this.config.borderColor)
            .style("stroke", "#000")
            .style("stroke-width", "0.5px");
        
        //Main Circle.    
        container.append("svg:circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", 0.9 * this.config.radius)
            .style("fill", this.config.mainCircleColor)
            .style("stroke", "#e0e0e0")
            .style("stroke-width", "2px");
        
        //Manage more space when no text values has to be displayed.    
        let transitionY = (!VisualSettings.textValuesSettings.show) ? (this.config.height/2-this.config.cy) : 0;
        
        //Transform "translate" dial gauge circles to the shown position.    
        container.selectAll("circle").attr("transform", `translate( ${this.config.width / 2 - this.config.radius},${transitionY})`);
        
        //Pointer Value Text.
        var fontsize = Math.round(this.config.size / 10);
        Element.append("svg:text")
            .text(Visual.prototype.Display_by_unit(this.config.pointerValue,VisualSettings.gauge.decimals).toLocaleString())
            .attr("x", this.config.cx)
            .attr("y", this.config.size - this.config.cy / 4 - fontsize)
            .attr("dy", fontsize / 2)
            .attr("text-anchor", "middle")
            .style("font-size", fontsize + "px")
            .style("fill", "#000")
            .style("stroke-width", "0px");
        
        //Dial Gauge Label.
        if (undefined != this.config.label)                       // Show label.
        {
            var fontsize = Math.round(this.config.size / 19);
            Element.append("svg:text")
                .text(this.config.label)
                .attr("x", this.config.cx)
                .attr("y", this.config.cy / 2 + fontsize / 2)
                .attr("dy", fontsize / 2)
                .attr("text-anchor", "middle")
                .style("font-size", fontsize + "px")
                .style("fill", "#333")
                .style("stroke-width", "0px");
        }
        
        //Ranges Set Up (Range 1,Range 2) (arcs colored).
        for (var index in this.config.range1)                 // Zones Range.
        {
            this.drawBand(this.config.range1[index].from, this.config.range1[index].to, self.config.range1color);
        }

        for (var index in this.config.range2) {
            this.drawBand(this.config.range2[index].from, this.config.range2[index].to, self.config.range2color);
        }
        
        //Ticks and Minor Ticks Labels Set Up.
        var fontsize = Math.round(this.config.size / 16);                // Scales Ticks Config.
        var majorScale = this.config.range / (this.config.majorTicks - 1);
        for (var major = this.config.min; (major <= this.config.max && VisualSettings.gauge.showTicks); major += majorScale) {
            var minorScale = majorScale / this.config.minorTicks;
            for (var minor = major + minorScale; minor < Math.min(major + majorScale, this.config.max); minor += minorScale) {
                var point1 = this.valueToPoint(minor, 0.75);
                var point2 = this.valueToPoint(minor, 0.85);

                Element.append("svg:line")
                    .attr("x1", point1.x)
                    .attr("y1", point1.y)
                    .attr("x2", point2.x)
                    .attr("y2", point2.y)
                    .style("stroke", "#666")
                    .style("stroke-width", "1px");

                Element.append("svg:text")
                    .text((VisualSettings.gauge.showMinor) ? Visual.prototype.Display_by_unit(minor,VisualSettings.gauge.decimals).toLocaleString() : null)
                    .attr("x", point1.x)
                    .attr("y", point1.y)
                    .attr("dy", 10 / 2)
                    .attr("text-anchor", "middle")
                    .style("font-size", 10 + "px")
                    .style("fill", "#333")
                    .style("stroke-width", "0px");
            }

            var point1 = this.valueToPoint(major, 0.7);
            var point2 = this.valueToPoint(major, 0.85);

            Element.append("svg:line")
                .attr("x1", point1.x)
                .attr("y1", point1.y)
                .attr("x2", point2.x)
                .attr("y2", point2.y)
                .style("stroke", "#333")
                .style("stroke-width", "2px");

            if (major == this.config.min || major == this.config.max) {
                var point = this.valueToPoint(major, 0.63);

                Element.append("svg:text")
                    .text(Visual.prototype.Display_by_unit(major,VisualSettings.gauge.decimals).toLocaleString())
                    .attr("x", point.x)
                    .attr("y", point.y)
                    .attr("dy", fontsize / 3)
                    .attr("text-anchor", major == this.config.min ? "start" : "end")
                    .style("font-size", fontsize + "px")
                    .style("fill", "#333")
                    .style("stroke-width", "0px");
            }
        }
        
        //Pointer Path build and Shape.
        Element.append("svg:g").attr("class", "pointerContainer"); // Pointer Set Up
        
        var midValue = (this.config.min + this.config.max) / 2;
        
        var pointerPath = this.buildPointerPath(midValue);
        
        var pointerLine = d3.line<Datatype>()
            .x(function (d) { return d.x })
            .y(function (d) { return d.y })

        //Pointer.
        Element.select(".pointerContainer").selectAll("path")
            .data([pointerPath])
            .enter()
            .append("svg:path")
            .attr("d", pointerLine)
            .style("fill", VisualSettings.gauge.pointerColor)
            .style("stroke", "#c63310")
            .style("fill-opacity", 0.7);

        //Pointer Circle/Central Circle.    
        Element.append("svg:circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", 0.12 * this.config.radius)
            .style("fill", this.config.centralCircleColor)
            .style("stroke", "#666")
            .style("opacity", 1);

        //Transform Most Elements to the shown Dial Gauge Position. 
        Element.selectAll("*").attr("transform", `translate( ${this.config.width / 2 - this.config.radius},${transitionY})`);
        
        //Transform Paths to the shown Dial Gauge Position.
        Element.selectAll("path").attr("transform", `translate( ${this.config.cx+this.config.width / 2 - this.config.radius},${this.config.cy+transitionY}) rotate(270)`);
        
        //Pointer Starts Pointing to Min Value (Start Value).
        this.redraw(this.config.min, 0);
    }

    this.buildPointerPath = function (value) {  //Build Pointer Path.
        var delta = this.config.range / 13;

        var head = valueToPoint(value, 0.85);
        var head1 = valueToPoint(value - delta, 0.12);
        var head2 = valueToPoint(value + delta, 0.12);

        var tailValue = value - (this.config.range * (1 / (270 / 360)) / 2);
        var tail = valueToPoint(tailValue, 0.28);
        var tail1 = valueToPoint(tailValue - delta, 0.12);
        var tail2 = valueToPoint(tailValue + delta, 0.12);

        return [head, head1, tail2, tail, tail1, head2, head];

        function valueToPoint(value, factor) {
            var point = self.valueToPoint(value, factor);
            point.x -= self.config.cx;
            point.y -= self.config.cy;
            return point;
        }
    }

    this.drawBand = function (start, end, color)           // Ranges Fill // Shape.
    {
        let width = this.config.width / 2 - this.config.radius;
        Element.append("path").style("fill", color)
            .attr("d", d3.arc()
                .startAngle(this.valueToRadians(start))
                .endAngle(this.valueToRadians(end))
                .innerRadius(0.65 * this.config.radius)
                .outerRadius(0.85 * this.config.radius))
            .attr("transform", function () { return "translate(" + (self.config.cx + width) + ", " + self.config.cy + ") rotate(270)" });
    }

    this.redraw = function (value, transitionDuration)     // Transition Pointer "Rotate" To The Given Value.
    {
        var pointerContainer = Element.select(".pointerContainer");

        pointerContainer.selectAll("text").text(Math.round(value));

        var pointer = pointerContainer.selectAll("path");
        pointer.transition()
            .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
            .attrTween("transform", function () {
                var pointerValue = value;
                if (value > self.config.max) pointerValue = self.config.max + 0.02 * self.config.range;
                else if (value < self.config.min) pointerValue = self.config.min - 0.02 * self.config.range;
                var targetRotation = (self.valueToDegrees(pointerValue) - 90);
                var currentRotation = self._currentRotation || targetRotation;
                self._currentRotation = targetRotation;

                return function (step) {
                    var rotation = currentRotation + (targetRotation - currentRotation) * step;
                    return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
                }
            });
    }

    this.valueToDegrees = function (value) { 
        return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
    }

    this.valueToRadians = function (value) {
        return this.valueToDegrees(value) * Math.PI / 180;
    }

    this.valueToPoint = function (value, factor) {
        return {
            x: this.config.cx - this.config.radius * factor * Math.cos(this.valueToRadians(value)),
            y: this.config.cy - this.config.radius * factor * Math.sin(this.valueToRadians(value))
        };
    }

    // Initialization.
    this.configure(configuration);
}