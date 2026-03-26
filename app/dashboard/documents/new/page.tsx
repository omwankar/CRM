'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';

export default function NewDocumentPage() {

  const router = useRouter();

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [file,setFile] = useState<File | null>(null);
  const [fileName,setFileName] = useState('');
  const [module,setModule] = useState('');

  /* Handle file selection */

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {

    if(e.target.files && e.target.files.length > 0){

      const selected = e.target.files[0];

      setFile(selected);
      setFileName(selected.name);

    }

  };

  /* Handle form submit */

  const handleSubmit = async(e:React.FormEvent) => {

    e.preventDefault();
    setError('');

    if(!file){

      setError('Please select a file');
      return;

    }

    setLoading(true);

    try{

      /* Create unique file name */

      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;

      /* Upload file to Supabase storage */

      const { error:uploadError } = await supabase
        .storage
        .from('documents')
        .upload(filePath,file);

      if(uploadError) throw uploadError;

      /* Save file path in database */

      const { error:insertError } = await supabase
        .from('documents')
        .insert([
          {
            module: module,
            record_id: null,
            file_name: file.name,
            file_url: filePath
          }
        ]);

      if(insertError) throw insertError;

      router.push('/dashboard/documents');

    }
    catch(err:any){

      setError(err.message || 'Upload failed');

    }
    finally{

      setLoading(false);

    }

  };

  return (

    <div className="space-y-6">

      <Link
        href="/dashboard/documents"
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      <Card className="p-8 max-w-2xl">

        <h1 className="text-2xl font-bold mb-6">
          Upload Document
        </h1>

        {error && (

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>

        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* MODULE */}

          <FieldGroup>

            <FieldLabel htmlFor="module">
              Module
            </FieldLabel>

            <Input
              id="module"
              placeholder="certifications / insurance / vendors"
              value={module}
              onChange={(e)=>setModule(e.target.value)}
              required
            />

          </FieldGroup>

          {/* FILE */}

          <FieldGroup>

            <FieldLabel htmlFor="file">
              File Upload
            </FieldLabel>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">

              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />

              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                className="hidden"
              />

              <label htmlFor="file" className="cursor-pointer">

                <p className="text-sm text-muted-foreground mb-1">
                  Click to select file
                </p>

                {fileName && (

                  <p className="text-sm text-primary font-medium">
                    {fileName}
                  </p>

                )}

              </label>

            </div>

          </FieldGroup>

          {/* BUTTONS */}

          <div className="flex gap-4 pt-4">

            <Button
              type="submit"
              disabled={loading}
            >

              {loading ? 'Uploading...' : 'Upload Document'}

            </Button>

            <Link href="/dashboard/documents">

              <Button variant="outline">
                Cancel
              </Button>

            </Link>

          </div>

        </form>

      </Card>

    </div>

  );

}