package edu.upenn.nets212.hw2;

import edu.upenn.nets212.Geocode;
import edu.upenn.nets212.Triple;
import edu.upenn.nets212.URLGeocodeWritable;

import org.apache.hadoop.mapreduce.*;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class GeocodeMapper extends Mapper<LongWritable, Text, Text, URLGeocodeWritable> {
	//emit dbpedia thing, geocode thing where image url is name in geocode obejct

	/* TODO: Your mapper code here */
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		Triple t = GeocodeDriver.parseTriple(value.toString());
		if (t != null) {
			// if from images files
			if (t.getPredicate().equals("http://xmlns.com/foaf/0.1/depiction")) {
				String db = t.getSubject();
				String url = t.getObject();
				// make object with dummy coordinates values
				URLGeocodeWritable u = new URLGeocodeWritable(url, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY);
				//System.out.println("emitted urls");
				context.write(new Text(db), u);
			} else {
				// if from coordinates file
				if(t.getPredicate().equals("http://www.georss.org/georss/point")) {
					String db = t.getSubject();
					Double[] latlon = GeocodeDriver.parseCoordinates(t.getObject());
					Geocode g = new Geocode("no url", latlon[0], latlon[1]);
					// if within 5km of target cities
					if (g.getHaversineDistance(39.88, -75.25) < 5000 ||
							g.getHaversineDistance(29.97, -95.35) < 5000 ||
							g.getHaversineDistance(47.45, -122.3) < 5000 ||
							g.getHaversineDistance(49.233, 7) < 5000) {
						URLGeocodeWritable u = new URLGeocodeWritable(g);
						//System.out.println("emitted coords");
						context.write(new Text(db), u);
					}
				}
			}
		}
	}

}
