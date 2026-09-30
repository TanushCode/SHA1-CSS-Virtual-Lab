package experiments.sha1;

import java.util.Scanner;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

class Main
{
    public static void main(String[] args)
    {
        Scanner sc=new Scanner(System.in);

        System.out.println("SHA-1 Generator");
        System.out.println("1. Generate SHA-1");
        System.out.println("2. Run correctness tests");
        System.out.print("Enter choice: ");

        int choice=sc.nextInt();
        sc.nextLine();

        try
        {
            MessageDigest md=MessageDigest.getInstance("SHA-1");

            if(choice==1)
            {
                System.out.println("Enter text to hash or type exit to end");

                while(sc.hasNextLine())
                {
                    String input=sc.nextLine();

                    if(input.equalsIgnoreCase("exit"))
                        break;

                    System.out.println(generateSHA1(input));

                    System.out.println("\nEnter next text (or 'exit'):");
                }
            }
            else if(choice==2)
            {
                runCorrectnessTests(md);
            }
            else
            {
                System.out.println("Invalid choice.");
            }
        }
        catch(NoSuchAlgorithmException e)
        {
            System.err.println("Algorithm not found: "+e.getMessage());
        }

        sc.close();
    }

    static String generateSHA1(String input) throws NoSuchAlgorithmException
    {
        MessageDigest md=MessageDigest.getInstance("SHA-1");
        byte[] digest=md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash=new StringBuilder();

        for(int i=0;i<digest.length;i++)
        {
            hash.append(String.format("%02x",digest[i]));
        }

        return hash.toString();
    }

    static void runCorrectnessTests(MessageDigest md)
    {
        String[] inputs={"","abc","hello","password"};
        String[] expected={
            "da39a3ee5e6b4b0d3255bfef95601890afd80709",
            "a9993e364706816aba3e25717850c26c9cd0d89d",
            "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
            "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8"
        };

        int passed=0;

        System.out.println("\n--- SHA-1 Correctness Tests ---");

        for(int i=0;i<inputs.length;i++)
        {
            md.reset();
            byte[] digest=md.digest(inputs[i].getBytes(StandardCharsets.UTF_8));

            String actual="";

            for(int j=0;j<digest.length;j++)
            {
                actual+=String.format("%02x",digest[j]);
            }

            System.out.println("Input: \""+inputs[i]+"\"");
            System.out.println("Expected: "+expected[i]);
            System.out.println("Actual:   "+actual);

            if(actual.equals(expected[i]))
            {
                System.out.println("Result: PASS\n");
                passed++;
            }
            else
            {
                System.out.println("Result: FAIL\n");
            }
        }

        System.out.println("Tests Passed: "+passed+"/"+inputs.length);
    }
}