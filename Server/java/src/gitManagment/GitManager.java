package gitManagment;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintStream;

public class GitManager {
	public static final String GIT_IGNORE = ".gitignore";
	File directory;

	public GitManager(File directory) {
		this.directory = directory;
	}

	/**
	 * Adds the file to git ignore, returns true if it is added or if it already exists
	 * Return false otherwise.
	 */
	public boolean addToIgnore(String addition) {
		File f = new File(directory, GIT_IGNORE);
		try {
			BufferedReader r = new BufferedReader(new FileReader(f));
			String nextLine = "";
			while ((nextLine = r.readLine()) != null) {
				if (nextLine.contains(addition) || nextLine.equals(addition)) {
					return true;
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}

		try {
			PrintStream stream = new PrintStream(new FileOutputStream(f,true));
			stream.println(addition);
			return true; // just stupdily assume it worked
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			return false;
		}
	}
}
