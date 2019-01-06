import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class IterMapper extends Mapper<LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		String[] all = value.toString().split("\t");
		String key1 = all[0];
		String adjbop = all[1];
		String adjout = all[1];
		String labels = all[2];
		
		String[] adjSplit;
		if (adjbop.length() == 2) {
			adjSplit = new String[0];
		} else {
			String adj = adjbop.substring(1, adjbop.length()-1);
			adjSplit = adj.split(",");
			
		}
		String[] labelsSplit;
		
		if (labels.length() == 2) {
			labelsSplit = new String[0];
		} else {
			labels = labels.substring(1, labels.length()-1);
			labelsSplit = labels.split(",");
		}
		if (!key1.toString().contains("%")) {
			context.write(new Text(key1), new Text(1 + " " + key1.toString()));
		}
		
		// write adj list
		context.write(new Text(key1), new Text(adjout));
		System.out.println(adjout);	
		
		for (String a : adjSplit) {
			for (String l : labelsSplit) {
					String[] eachLabel = l.split(" ");
					if (eachLabel[0].length() > 0) {
					double labelWeight = Double.parseDouble(eachLabel[0]);
					double update = 1.0 / adjSplit.length * labelWeight;
					context.write (new Text(a.trim()), new Text(update + " " + eachLabel[1]));
					System.out.println(a + " -> " + update + " " + eachLabel[1]);
					}
			}
		}
		
			
 	}
}