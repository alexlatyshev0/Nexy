'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryInfo {
  slug: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryInfo | null;
  tags: string[];
  onConfirm: (type: 'category' | 'tag' | 'scene', value: string, level: 'soft' | 'hard') => void;
}

export function ExclusionDialog({ isOpen, onClose, category, tags, onConfirm }: Props) {
  const [type, setType] = useState<'category' | 'tag' | 'scene'>('category');
  const [selectedTag, setSelectedTag] = useState('');
  const [level, setLevel] = useState<'soft' | 'hard'>('hard');

  const handleConfirm = () => {
    if (type === 'tag' && !selectedTag) return;
    const value = type === 'category' ? category?.slug || '' : type === 'tag' ? selectedTag : 'scene';
    onConfirm(type, value, level);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Что не нравится?</DialogTitle>
        </DialogHeader>

        <RadioGroup value={type} onValueChange={(v) => setType(v as 'category' | 'tag' | 'scene')}>
          {category && (
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="category" id="category" />
              <div className="flex-1">
                <div className="font-medium">Вся категория «{category.name}»</div>
                <div className="text-sm text-muted-foreground">Больше не показывать похожее</div>
              </div>
            </label>
          )}

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="tag" id="tag" />
            <div className="flex-1">
              <div className="font-medium">Конкретный элемент</div>
              {type === 'tag' && tags.length > 0 && (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выбери..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="scene" id="scene" />
            <div className="flex-1">
              <div className="font-medium">Только эта картинка</div>
              <div className="text-sm text-muted-foreground">Категория может нравиться</div>
            </div>
          </label>
        </RadioGroup>

        <div className="border-t pt-4 mt-2">
          <div className="text-sm font-medium mb-3">Насколько строго?</div>
          <RadioGroup value={level} onValueChange={(v) => setLevel(v as 'soft' | 'hard')}>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="hard" id="hard" />
              <span className="text-sm">Не показывать совсем</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="soft" id="soft" />
              <span className="text-sm">Показывать реже</span>
            </label>
          </RadioGroup>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={type === 'tag' && !selectedTag}
          >
            Подтвердить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
