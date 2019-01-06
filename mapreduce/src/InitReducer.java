import java.io.IOException;
import java.util.ArrayList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;


public class InitReducer extends Reducer<Text, Text, Text, Text> {

	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		ArrayList<String> adj = new ArrayList<String>();
		for (Text t : values) {
			adj.add(t.toString());
		}
		ArrayList<String> labels = new ArrayList<String>();
		if (!key.toString().contains("%")) {
			labels.add("1 " + key.toString());
		}
		context.write(key, new Text(adj.toString() + "\t" + labels.toString()));
	}
}