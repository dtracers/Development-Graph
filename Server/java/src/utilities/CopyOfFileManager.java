package utilities;

import java.awt.Toolkit;
import java.awt.event.WindowEvent;
import java.io.File;
import java.util.ArrayList;

import javax.swing.JFileChooser;
import javax.swing.JFrame;

public class CopyOfFileManager {
	public static File showDirectoryDialog() {
		final ArrayList<File> list = new ArrayList<File>();
		Thread d = new Thread() {
			public void run() {

				System.out.println("Creating dialog");
				JFileChooser chooser = new JFileChooser();
				chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
				int returnVal = chooser.showOpenDialog(null);
				System.out.println("Dialog done");

				if (returnVal == JFileChooser.APPROVE_OPTION) {
					File f = chooser.getSelectedFile();
					list.add(f);
				} else {
					list.add(null);
				}
			}
		};
		d.start();
		while(list.isEmpty()) {
			System.out.println("Blocking!");
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		return list.get(0);
	}

	/**
	 * Returns true if the directory is read only.
	 */
	public static boolean isDirectoryReadOnly(File dir) {
		return !(dir.canWrite() && dir.canExecute());
	}

	public static void main(String args[]) {
		showDirectoryDialog();
		System.out.println("FINISH");
		showDirectoryDialog();
		System.out.println("FINISH");
	}
}
