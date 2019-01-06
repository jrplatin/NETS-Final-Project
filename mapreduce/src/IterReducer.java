import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;


public class IterReducer extends Reducer<Text, Text, Text, Text> {
	@Override
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		String adj = "";
		Map<String, Double> map = new HashMap<String, Double>();
		double sum = 0;
		ArrayList<String> s = new ArrayList<String>();
		for (Text t : values) {
			System.out.println(key + " : " + t);
			if (t.toString().startsWith("[")) {
				adj = t.toString();
				System.out.println("adj found: " + adj);
			} else {
				s.add(t.toString());
			}
		}
		
		for(String j :s) {
			j = j.trim();
			String[] split = j.split(" ");
			sum += Double.parseDouble(split[0]);
		}
		
		
		for (String j : s) {
				String[] arr = j.split(" ");
				double newW = Double.parseDouble(arr[0])/sum;
				if (!map.containsKey(arr[1])) {
					map.put(arr[1], newW);
				} else {
					double d = map.get(arr[1]);
					map.put(arr[1], d + newW);
				}
		}
		
		ArrayList<String> out = new ArrayList<String>();
		for (Map.Entry<String, Double> e : map.entrySet()) {
			out.add(e.getValue() + " " + e.getKey());
		}
		context.write(key, new Text(adj + "\t" + out));
		
	}
}