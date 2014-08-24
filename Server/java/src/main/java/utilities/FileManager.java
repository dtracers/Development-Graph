package utilities;

import java.io.File;

import javax.swing.JFileChooser;

public class FileManager {
	private static JFileChooser chooserInstance;
	public static void main(String args[]) {
		showDirectoryDialog();
		System.out.println("BLOCKING");
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		showDirectoryDialog();
		System.out.println("BLOCKING");
	}

	/**
	 * On mac's there is an issue with a dialog not appearing unless the same dialog is persisted.
	 */
	private static JFileChooser getInstance() {
		if (chooserInstance == null) {
			chooserInstance = new JFileChooser();
		}
		return chooserInstance;
	}

	public static File showDirectoryDialog() {
		System.out.println("Creating dialog");
		JFileChooser chooser = getInstance();
		chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
		chooser.requestFocus();
		chooser.requestFocusInWindow();
		chooser.setVisible(true);
		int returnVal = chooser.showOpenDialog(null);
		System.out.println("Dialog done");
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			File f = chooser.getSelectedFile();
			return f;
		}
		return null;
	}
	
	/**
	 * Returns true if the directory is read only.
	 */
	public static boolean isDirectoryReadOnly(File dir) {
		return !(dir.canWrite() && dir.canExecute());
	}

}


