import { Component, input, OnInit, output, signal } from '@angular/core';
import { Icon } from '../../icon/icon';

@Component({
  selector: 'app-upload-input',
  imports: [Icon],
  templateUrl: './img-uploader.html',
  styleUrl: './img-uploader.css',
})
export class ImgUploader implements OnInit {
  initialFile = input<File | null>(null);
  initialUrl = input<string | null>(null);

  fileSelected = output<File>();
  fileError = output<'incorrectFormat' | 'tooLarge'>();

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragging = signal(false);

  ngOnInit() {
    if (this.initialFile()) {
      this.selectedFile.set(this.initialFile()!);
      this.previewUrl.set(URL.createObjectURL(this.initialFile()!));
    } else if (this.initialUrl()) {
      this.previewUrl.set(this.initialUrl());
    }
  }

  private readonly maxSize = 2 * 1024 * 1024;
  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  onFileSelected(event: any) {
    this.setFile(event.target.files[0]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.setFile(files[0]);
  }

  private setFile(file: File) {
    if (!file) return;

    if (!this.allowedTypes.includes(file.type)) {
      this.fileError.emit('incorrectFormat');
      return;
    }
    if (file.size > this.maxSize) {
      this.fileError.emit('tooLarge');
      return;
    }

    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    this.fileSelected.emit(file);
  }
}
